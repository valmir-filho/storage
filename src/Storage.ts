"use strict";

import fs from "node:fs";
import path from "node:path";
import zlib from "zlib";
import { Time, Size } from "./Units";


export class Storage {
	// private _name: string;
	private _basePath: string;
	private _rootPath: string;
	// private _fileTypes: string[];
	private _maxFileSizeBytes: number;
	private _maxFileAgeAmount = 0;
	private _maxFileAgeUnit: AllowedTimeUnitsT = "h";
	private _maxFileAgeMs = 0;
	private _firstDayOfWeek = 0;
	// private _backupPath: string;
	// private _useCompression: boolean;
	// private _protected: boolean;
	// private _indexed: boolean;
	private _tree: string[] = [];

	constructor (config: StorageConfigT) {
		if (!config.path || !config.name) {
			throw new Error("storage: Constructor parameter(s) not informed.");
		}
		this._basePath = config.path;
		this._rootPath = path.join(config.path, config.name);
		this._maxFileSizeBytes = config.maxFileSize ? this.parseSizeStringToBytes(config.maxFileSize) : 0;
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
		// this._backupPath = config.backupPath || "";
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

	public set maxFileAge(ageObject: ParsedAgeT) {
		this._maxFileAgeAmount = ageObject.amount;
		this._maxFileAgeUnit = ageObject.unit;
		this._maxFileAgeMs = ageObject.ms || 0;
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

	// Method to compress files.
	public compressFiles() {
		const zip = zlib.createGzip();
		const inp = fs.createReadStream("./87.txt");
		const out = fs.createWriteStream("./87.gz");
		inp.pipe(zip).pipe(out);
	}

	// Method to decompress files.
	public decompressFiles() {
		const unzip = zlib.createUnzip();
		const inp = fs.createReadStream("./87.gz");
		const out = fs.createWriteStream("./87.txt");
		inp.pipe(unzip).pipe(out);
	}
}
// private runBackup() {
// 	throw new Error("Método não implementado");
// }

// private search() { 
// 	throw new Error("Método não implementado");
// }

type StorageConfigT = {
	name: string;
	path: string;
	fileTypes?: string[];
	maxFileSize?: string;
	maxFileAge?: string;
	firstDayOfWeek?: 0 | 1 | "sunday" | "monday";
	backupPath?: string;
	useCompression?: boolean;
	protected?: boolean;
	indexed?: boolean;
};

type AllowedTimeUnitsT = "h" | "d" | "w" | "m" | "y";
type ParsedAgeT = { amount: number, unit: AllowedTimeUnitsT; ms?: number; };