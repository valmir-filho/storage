/* eslint-disable @typescript-eslint/no-unused-vars */

export function calculaIntervaloMeses(dataOrigem: Date, qtdMeses: number): Date {
	
	if (!(dataOrigem instanceof Date)) throw new Error("O 1º argumento da função (dataOrigem) precisa ser um objeto do tipo Date");
	if (typeof qtdMeses !== "number") throw new Error("O 2º argumento da função (qtdMeses) precisa ser do tipo 'number'");

	return new Date(dataOrigem.getFullYear(), (dataOrigem.getMonth() - qtdMeses), 1);
}