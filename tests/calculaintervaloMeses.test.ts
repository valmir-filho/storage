/* eslint-disable @typescript-eslint/no-unused-vars */

import { calculaIntervaloMeses } from "./calculaIntervaloMeses";

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

const testes: { dataOrigem: Date; qtdMeses: number; resultadoEsperado: Date; }[] = [
	{
		dataOrigem: new Date(2022, OCT, 24, 9, 37),
		qtdMeses: 1,
		resultadoEsperado: new Date(2022, SEP, 1),
	},
	{
		dataOrigem: new Date(2023, JAN, 1, 9, 37),
		qtdMeses: 3,
		resultadoEsperado: new Date(2022, OCT, 1),
	},
	{
		dataOrigem: new Date(2023, JAN, 21, 9, 37),
		qtdMeses: 5,
		resultadoEsperado: new Date(2022, AUG, 1),
	},
	{
		dataOrigem: new Date(2023, JAN, 21, 9, 37),
		qtdMeses: 48,
		resultadoEsperado: new Date(2019, JAN, 1),
	}
];

for (const teste of testes) {
	console.log("--------------- TESTE -----------------");
	console.log(`\x1b[31mDATA DE ORIGEM:    \x1b[0m \x1b[31m${teste.dataOrigem.toLocaleString()}\x1b[0m`);
	console.log(`QTD MESES:        ${teste.qtdMeses}`);
	console.log(`\x1b[31mRESULTADO ESPERADO: ${teste.resultadoEsperado.toLocaleString()}\x1b[0m\n`);
	console.assert(
		teste.resultadoEsperado.getTime() === calculaIntervaloMeses(teste.dataOrigem, teste.qtdMeses).getTime(),
		`
\x1b[41mRESULTADO OBTIDO:   ${calculaIntervaloMeses(teste.dataOrigem, teste.qtdMeses).toLocaleString()}\x1b[0m

	`
	);
}