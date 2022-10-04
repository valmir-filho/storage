import fs from "node:fs";
import path from "node:path";

export class Archive {
	name: string;

    constructor(name: string) {
		this.name = name;
	}

	// Create a new empty file.
	createNewFile() {
		fs.open(this.name , "w",  (err) => {
			if (err) throw err;
			console.log(`Arquivo ${this.name} gerado com sucesso!`);
		});
	}

	// Append specified content to a file. If the file does not exist, will be created.
	appendFile() {
		fs.appendFile(this.name, "content", (err) => {
			if (err) throw err;
			console.log(`Arquivo ${this.name} gerado com sucesso!`);
			console.log("Conteúdo adicionado no arquivo com sucesso!");
		});
	}

	// Delete a file.
	deleteFile() {
		if (fs.existsSync(path.resolve(this.name))) {
			fs.unlink(this.name, (err) => {
				if (err) throw err;
				console.log(`Arquivo ${this.name} excluído com sucesso!`);
			});
		} else {
			console.log("Erro! Arquivo inexistente.");
		}
	}

	// Copy a file.
	copyFile() {
		fs.copyFile(this.name, this.name, (err) => {
			if (err) {
				console.log("Impossível copiar! Arquivo inexistente.");	
			} else {
				fs.open(this.name + "(cópia)", "w", (err) => {
					if (err) throw err;
					console.log(`Arquivo ${this.name}(cópia) copiado com sucesso!`);
				});
			}
		});
	}

	// Rename a file.
	renameFile(newName: string) {
		fs.rename(this.name, newName, (err) => {
			if (err) throw err;
			console.log(`Arquivo ${this.name} renomeado para ${newName} com sucesso!`);
		});
	}
}