/* eslint-disable @typescript-eslint/no-unused-vars */

export type DiaSemanaT = 0 | 1;

export function calculaIntervaloSemanas(dataOrigem: Date, primeiroDiaSemana: DiaSemanaT, qtdSemanas: number): Date {
	
	if (!(dataOrigem instanceof Date)) throw new Error("O 1º argumento da função (dataOrigem) precisa ser um objeto do tipo Date");
	if (primeiroDiaSemana !== 0 && primeiroDiaSemana !== 1) throw new Error("Dia da semana precisa ser 0 ou 1 (domingo ou segunda)");
	if (typeof qtdSemanas !== "number") throw new Error("O 3º argumento da função (qtdSemanas) precisa ser do tipo 'number'");

	const diaDaSemanaDataOrigem = dataOrigem.getDay();
	const inicioDataOrigem = new Date(dataOrigem.getFullYear(), dataOrigem.getMonth(), dataOrigem.getDate());
	const dataSemanasPraTras = new Date(inicioDataOrigem.getFullYear(), inicioDataOrigem.getMonth(), inicioDataOrigem.getDate() - (qtdSemanas * 7) - (diaDaSemanaDataOrigem === 0 ? diaDaSemanaDataOrigem + 7 - primeiroDiaSemana : diaDaSemanaDataOrigem - primeiroDiaSemana));

	return dataSemanasPraTras;
}