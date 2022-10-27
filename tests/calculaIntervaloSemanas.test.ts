/* eslint-disable @typescript-eslint/no-unused-vars */

import { calculaIntervaloSemanas, DiaSemanaT } from "./calculaIntervaloSemanas";

const JAN = 0;
const FEB = 1;
const MAR = 2;
const APR = 3;
const MAY = 4;
const JUN = 5;
const JUL = 6;
const AUG = 7;
const SEP = 8;
const OCT = 9;
const NOV = 10;
const DEC = 11;

const testes: { dataOrigem: Date; qtdSemanas: number; primeiroDiaSemana: number; resultadoEsperado: Date; }[] = [
	{
		dataOrigem: new Date(2022, OCT, 21, 9, 37),
		qtdSemanas: 0,
		primeiroDiaSemana: 0,
		resultadoEsperado: new Date(2022, OCT, 16),
	},
	{
		dataOrigem: new Date(2022, OCT, 21, 9, 37),
		qtdSemanas: 1,
		primeiroDiaSemana: 0,
		resultadoEsperado: new Date(2022, OCT, 9),
	},
	{
		dataOrigem: new Date(2022, OCT, 17, 14, 28),
		qtdSemanas: 2,
		primeiroDiaSemana: 1,
		resultadoEsperado: new Date(2022, OCT, 3),
	},
	{
		dataOrigem: new Date(2022, OCT, 17, 14, 28),
		qtdSemanas: 3,
		primeiroDiaSemana: 0,
		resultadoEsperado: new Date(2022, SEP, 25),
	},
	{
		dataOrigem: new Date(2022, OCT, 17, 14, 28),
		qtdSemanas: 0,
		primeiroDiaSemana: 0,
		resultadoEsperado: new Date(2022, OCT, 16),
	},
	{
		dataOrigem: new Date(2022, OCT, 20, 14, 28),
		qtdSemanas: 0,
		primeiroDiaSemana: 1,
		resultadoEsperado: new Date(2022, OCT, 17),
	},
	{
		dataOrigem: new Date(2024, MAR, 1, 14, 28),
		qtdSemanas: 1,
		primeiroDiaSemana: 1,
		resultadoEsperado: new Date(2024, FEB, 19),
	},
	{
		dataOrigem: new Date(2024, MAR, 1, 14, 28),
		qtdSemanas: 1,
		primeiroDiaSemana: 0,
		resultadoEsperado: new Date(2024, FEB, 18),
	},
	{
		dataOrigem: new Date(2024, MAR, 1, 14, 28),
		qtdSemanas: 0,
		primeiroDiaSemana: 1,
		resultadoEsperado: new Date(2024, FEB, 26),
	},
	{
		dataOrigem: new Date(2024, MAR, 1, 14, 28),
		qtdSemanas: 0,
		primeiroDiaSemana: 0,
		resultadoEsperado: new Date(2024, FEB, 25),
	},
	{
		dataOrigem: new Date(2024, MAR, 1, 14, 28),
		qtdSemanas: 0,
		primeiroDiaSemana: 3,
		resultadoEsperado: new Date(0),
	},
];

for (const teste of testes) {
	console.log("--------------- TESTE -----------------");
	console.log(`\x1b[31mDATA DE ORIGEM:    \x1b[0m \x1b[31m${teste.dataOrigem.toLocaleString()}\x1b[0m`);
	console.log(`QTD SEMANAS:        ${teste.qtdSemanas}`);
	console.log(`1º DIA SEMANA:      ${teste.primeiroDiaSemana}`);
	console.log(`\x1b[31mRESULTADO ESPERADO: ${teste.resultadoEsperado.toLocaleString()}\x1b[0m\n`);
	console.assert(
		teste.resultadoEsperado.getTime() === calculaIntervaloSemanas(teste.dataOrigem, <DiaSemanaT>teste.primeiroDiaSemana, teste.qtdSemanas).getTime(),
		`
\x1b[41mRESULTADO OBTIDO:   ${calculaIntervaloSemanas(teste.dataOrigem, <DiaSemanaT>teste.primeiroDiaSemana, teste.qtdSemanas).toLocaleString()}\x1b[0m

	`
	);
}