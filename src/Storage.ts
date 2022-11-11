"use strict";

import fs from "node:fs";
import path from "node:path";
import { Time, Size } from "./Units";
import zlib from "node:zlib";

export class Storage {
	private _name!: string;
	private _basePath: string;
	private _rootPath: string;
	// private _fileTypes: string[];
	private _maxFileSizeBytes = Infinity;
	private _maxFileAgeAmount = 0;
	private _maxFileAgeUnit: AllowedTimeUnitsT = "h";
	private _maxFileAgeMs = 0;
	private _firstDayOfWeek = 0;
	private _backupPath: string | undefined;
	// private _useCompression: boolean;
	// private _protected: boolean;
	// private _indexed: boolean;
	private _tree: string[] = [];

	public set maxFileAge(ageObject: ParsedAgeT) {
		this._maxFileAgeAmount = ageObject.amount;
		this._maxFileAgeUnit = ageObject.unit;
		this._maxFileAgeMs = ageObject.ms || 0;
	}

	public get name() { return this._name; }

	public set name(newName: string) {
		const nameChars = newName.trim().split("");
		if (nameChars.length > 32) throw new Error("storage: Name exceeds the maximum length of 32 characters.");
		const forbiddenCharacters = ("+=ªº°´`'\"~^¨:,;.!?()[]{}@#$%&*<>|/\\").split("");
		if (nameChars.some(char => forbiddenCharacters.includes(char))) throw new Error("storage: Name has forbidden characters: +=*ªº°´`~^¨'\":,;.!?()[]{}@#$%&<>|\\/");
		this._name = newName;
	}

	constructor (config: StorageConfigT) {
		if (!config.path || !config.name) {
			throw new Error("storage: Constructor parameter(s) not informed.");
		}
		this.name = config.name;
		this._basePath = config.path;
		this._rootPath = path.join(config.path, config.name);
		this._maxFileSizeBytes = config.maxFileSize ? this.parseSizeStringToBytes(config.maxFileSize) : Infinity;
		if (config.maxFileAge) {
			this.maxFileAge = this.parseAgeString(config.maxFileAge);
		}
		if (
			config.firstDayOfWeek === 0 ||
			(typeof config.firstDayOfWeek === "string" && config.firstDayOfWeek.toLowerCase() === "sunday")
		) {
			this._firstDayOfWeek = 0;
		} else if (
			config.firstDayOfWeek === 1 ||
			(typeof config.firstDayOfWeek === "string" && config.firstDayOfWeek.toLowerCase() === "monday")
		) {
			this._firstDayOfWeek = 1;
		} else {
			throw new Error("storage: Valid first day of week options are: 0, 1, 'sunday' or 'monday'.");
		}
		this._backupPath = config.backupPath || undefined;
		// this._useCompression = config.useCompression === true;
		// this._protected = config.protected === false ? false : true;
		// this._indexed = config.indexed === true;
	}

	// Method to convert diferents files storage units.
	private parseSizeStringToBytes(fileSize: string): number {
		// with Positive lookbehind (?<=) and Positive lookahead (?=):
		const [size, unit] = fileSize.replaceAll(" ", "").split(/(?<=\d)(?=\D)/);
		if (!size || !unit) throw new Error("storage: Insert a positive numeric value followed by a storage unit: 'B', 'KB', 'MB', 'GB'.");
		if (+size <= 0) throw new Error("storage: Numeric value must be positive and greater than zero.");
		if (unit === "B") return +size;
		else if (unit === "KB") return +size * Size.KILOBYTE;
		else if (unit === "MB") return +size * Size.MEGABYTE;
		else if (unit === "GB") return +size * Size.GIGABYTE;
		else throw new Error("storage: Invalid unit! Use: B, KB, MB ou GB.");
	}

	// Method to convert diferents files age to milliseconds.
	private parseAgeString(ageInput: string): ParsedAgeT {
		// With positive lookbehind (?<=) and positive lookahead (?=).
		const [age, unit] = ageInput.replaceAll(" ", "").split(/(?<=\d)(?=\D)/);
		if (!age || !unit) throw new Error("storage: Insert a positive numeric value followed by a time unit: 'h', 'd', 'w', 'm' ou 'y'.");
		if (+age <= 0 || +age > 1_000_000) throw new Error("storage: Numeric value must be positive, greater than zero and less than 1_000_000.");
		switch (unit) {
			case "h":
				return {
					amount: +age,
					unit: unit,
					ms: +age * Time.HOUR
				};
			case "d":
				return {
					amount: +age,
					unit: unit,
					ms: +age * Time.DAY
				};
			case "w":
				return {
					amount: +age,
					unit: unit,
					ms: +age * Time.WEEK,
				};
			case "m":
			case "y":
				return {
					amount: +age,
					unit: unit
				};
			default:
				throw new Error("storage: Invalid unit! Use: 'h', 'd', 'w', 'm' ou 'y'.");
		}
	}

	// Method to show the hierarchy of directories and files.
	public getTree(dir?: string, parentDir?: string) {
		const rootDir = fs.readdirSync(dir || this._rootPath, { withFileTypes: true });
		rootDir.forEach(entry => {
			if (entry.isDirectory()) {
				this._tree.push(path.join(parentDir || "", entry.name) + path.sep);
				this.getTree(path.join(this._rootPath, entry.name), entry.name);
			}
			else if (entry.isFile()) {
				this._tree.push(path.join(parentDir || "", entry.name));
			}
		});
		return this._tree;
	}

	// Method to clear old files, according to the last time of modification.
	public clearIdleFiles(thresholdDate?: Date): void {
		let threshold = -Infinity;
		if (thresholdDate) {
			if (thresholdDate instanceof Date) {
				threshold = thresholdDate.getTime();
			} else {
				throw new Error("storage: Inserted value is not a Date object.");
			}
		} else {
			if (this._maxFileAgeAmount === 0) return;
			const now = new Date();
			if (this._maxFileAgeUnit === "y" || this._maxFileAgeUnit === "m") {
				const multiplier = this._maxFileAgeUnit === "y" ? 12 : 1;
				threshold = new Date(now.getFullYear(), now.getMonth() - (this._maxFileAgeAmount * multiplier), 1).getTime();
			}
			else if (this._maxFileAgeUnit === "w") {
				const todayWeekday = now.getDay();
				threshold = new Date(
					now.getFullYear(),
					now.getMonth(),
					now.getDate() - (this._maxFileAgeAmount * 7) - (todayWeekday === 0 ? todayWeekday + 7 - this._firstDayOfWeek : todayWeekday - this._firstDayOfWeek)
				).getTime();
			}
			else if (this._maxFileAgeUnit === "d") {
				threshold = new Date(now.getFullYear(), now.getMonth(), now.getDate() - this._maxFileAgeAmount).getTime();
			}
			else if (this._maxFileAgeUnit === "h") {
				threshold = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - this._maxFileAgeAmount).getTime();
			}
		}
		this.getTree().forEach(filename => {
			const filePath = path.join(this._rootPath, filename);
			const modifiedTime = fs.statSync(filePath).mtimeMs;
			if (fs.statSync(filePath).isFile() && modifiedTime < threshold) {
				fs.unlink(filePath, (err) => {
					if (err) {
						console.log("storage: Undeleted file!");
						throw err;
					}
					console.log(`storage: ${filename} successfully deleted!`);
				});
			}
		});
	}

	// Method to backup files (compressing them), from origin to specified destination.
	public runBackup(destinationBackupPath = this._backupPath) {
		this.getTree().forEach(filename => {
			const gzip = zlib.createGzip();
			const input = fs.createReadStream(path.join(this._rootPath, filename));
			const output = fs.createWriteStream(destinationBackupPath + filename);
		input.pipe(gzip).pipe(output);
		});
	}

	// Method to search files, according to the following parameters: name, size or modifiedDate.
	public searchFiles(fileConfig?: SearchFilesObjectT) {
		const mapFileToObject = (filePath: string) => {
			const fileSpecs = fs.statSync(path.join(this._rootPath, filePath));
			return {
				path: path.join(this._rootPath, filePath),
				name: path.basename(filePath),
				modifiedDate: new Date(fileSpecs.mtimeMs),
				size: fileSpecs.size,
			};
		};
		if (fileConfig) {
			if (fileConfig.fileName && typeof fileConfig.fileName !== "string") throw new Error("storage: fileName must be of type string");
			if (fileConfig.modificationDate?.oldest && !(fileConfig.modificationDate?.oldest instanceof Date)) throw new Error("storage: modificationDate.oldest must be of Date object.");
			if (fileConfig.modificationDate?.newest && !(fileConfig.modificationDate?.newest instanceof Date)) throw new Error("storage: modificationDate.newest must be of Date object.");
		} else {
			return this.getTree().map(mapFileToObject);
		}
		const searchCriteria = {
			fileName: fileConfig?.fileName ?? "",
			fileSize: {
				lowerBound: fileConfig?.fileSize?.lowerBound ? this.parseSizeStringToBytes(fileConfig.fileSize.lowerBound) : 0,
				upperBound: fileConfig?.fileSize?.upperBound ? this.parseSizeStringToBytes(fileConfig.fileSize.upperBound) : Infinity,
			},
			modificationDate: {
				oldest: fileConfig?.modificationDate?.oldest ?? new Date(-8_640_000_000_000_000),
				newest: fileConfig?.modificationDate?.newest ?? new Date(8_640_000_000_000_000),
			},
		};
		if (searchCriteria.fileSize.lowerBound > searchCriteria.fileSize.upperBound) {
			[searchCriteria.fileSize.lowerBound, searchCriteria.fileSize.upperBound] = [searchCriteria.fileSize.upperBound, searchCriteria.fileSize.lowerBound];
		}
		if (searchCriteria.modificationDate.oldest > searchCriteria.modificationDate.newest) {
			[searchCriteria.modificationDate.oldest, searchCriteria.modificationDate.newest] = [searchCriteria.modificationDate.newest, searchCriteria.modificationDate.oldest];
		}
		return this.getTree()
			.map(mapFileToObject)
			.filter(file => {
				return file.path.includes(searchCriteria.fileName) &&
					file.modifiedDate >= searchCriteria.modificationDate.oldest &&
					file.modifiedDate <= searchCriteria.modificationDate.newest &&
					file.size >= searchCriteria.fileSize.lowerBound &&
					file.size <= searchCriteria.fileSize.upperBound;
			});
	}
}

type StorageConfigT = {
	name: string;
	path: string;
	fileTypes?: string[];
	maxFileSize?: string;
	maxFileAge?: string;
	firstDayOfWeek?: 0 | 1 | "sunday" | "monday";
	backupPath?: string | undefined;
	useCompression?: boolean;
	protected?: boolean;
	indexed?: boolean;
};

type AllowedTimeUnitsT = "h" | "d" | "w" | "m" | "y";

type ParsedAgeT = { amount: number; unit: AllowedTimeUnitsT; ms?: number; };

type SearchFilesObjectT = {
	fileName?: string;
	fileSize?: {
		lowerBound?: string;
		upperBound?: string;
	};
	modificationDate?: {
		oldest?: Date;
		newest?: Date;
	};
};