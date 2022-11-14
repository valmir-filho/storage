// import { inspect } from "node:util";
import { Storage } from "../src/Storage";

const storage = new Storage({
	name: "images",
	path: "C:\\storage",
	maxFileSize: "1MB",
	maxFileAge: "1w",
	firstDayOfWeek: 1
});

// console.log(inspect(storage, false, null, true));
// console.log(storage.name);
// storage.name = "album";
// console.log(storage.name);
// console.log(storage.searchFiles({
// 	// fileName: "",
// 	fileSize: {
// 		lowerBound: "",
// 		upperBound: "",
// 	}, 
// 	modificationDate: {
// 		newest: new Date(2015, 10, 21),
// 		oldest: new Date(2023, 10, 21)
// 	},
// }));

// console.log(storage.getTree());
storage.runBackup("C:\\Users\\vconque\\Documents\\storage\\tests\\files");