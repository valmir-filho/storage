Repositório da biblioteca criada para desenvolvedores, contendo funções úteis de gerenciamento de arquivos dos projetos Node com TypeScript para Windows.

IDE utilizada: Visual Studio Code.

## Classe **Storage**

### Instanciação 

```typescript
import { Storage } from "./Storage";

const imagesStorage = new Storage({
	name: "images",
	path: "C:\\storage", // Identifica automaticamente o SO utilizado.
	fileTypes: ["jpg", "jpeg", "gif", "png", "svg"],
	maxFileSize: "2MB",
	maxFileAge: "12d",
	backupPath: "D:\\backup",
	useCompression: true,
	protected: true, // Se a pasta que o Storage administra será bloqueada para modificação externa
	indexed: true,
});
```

### Atributos

```ts
imagesStorage.size;
imagesStorage.
```

### Métodos

```ts
imagesStorage.runBackup();
imagesStorage.clearOldFiles();
imagesStorage.clearOldFiles("1y");
imagesStorage.search("ToDo");  // Retorna um array com os resultados da pesquisa.
imagesStorage.getCurrentFolderStructure();
```

## Classe **File**

File.fromBinary();

## Classe **Directory**

## Roadmap

- Criptografia de arquivos;
- Definição da estrutura de pastas inicial