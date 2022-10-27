import { inspect } from "node:util";
import { Storage } from "../src/Storage";

const storage = new Storage({
	name: "images",
	path: "C:\\storage",
	maxFileSize: "1MB",
	maxFileAge: "1w",
	firstDayOfWeek: 1
});

// console.log(inspect(storage, false, null, true));
// console.log(storage.getTree());
// storage.clearIdleFiles();
// storage.clearIdleFiles(new Date);
storage.decompressFiles();