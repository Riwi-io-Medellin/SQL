// generar_csv.js
// Genera un archivo empleados.csv con 1 000 000 de registros usando @faker-js/faker
// Ejecución:
//   npm init -y
//   npm install @faker-js/faker
//   node generar_csv.js

// Importa la librería faker para generar datos falsos realistas
const { faker } = require('@faker-js/faker');
// Módulo nativo de Node.js para interactuar con el sistema de archivos
const fs = require('fs');

// Arreglo con los posibles nombres de departamento
const DEPARTAMENTOS = ['Ventas', 'TI', 'RRHH', 'Finanzas', 'Marketing'];
// Cantidad total de registros a generar
const REGISTROS = 1500;  // cambia este valor según lo necesario
// Crea un stream de escritura hacia el archivo empleados.csv usando codificación UTF-8
const file = fs.createWriteStream('empleados.csv', { encoding: 'utf8' });

// Escribe la fila de encabezado para que DBeaver pueda mapear columnas automáticamente
file.write('id,nombre,apellido,departamento,edad,salario,fecha_ingreso\n');

// Bucle principal: genera un registro y lo escribe en el CSV en cada iteración
for (let i = 0; i < REGISTROS; i++) {
  const id = i + 1;                                                         // id secuencial (1, 2, 3 …)
  const nombre = faker.person.firstName();                                  // Nombre aleatorio
  const apellido = faker.person.lastName();                                 // Apellido aleatorio
  const depto = faker.helpers.arrayElement(DEPARTAMENTOS);                  // Departamento aleatorio
  const edad = faker.number.int({ min: 20, max: 65 });                      // Edad entre 20 y 65 años
  const salario = faker.number.int({ min: 1200, max: 6000 });               // Salario entre 1 200 y 6 000
  const fecha_ingreso = faker.date.past({ years: 15 }).toISOString().slice(0, 10); // Fecha dentro de los últimos 15 años (YYYY-MM-DD)

  // Orden de columnas: id, nombre, apellido, departamento, edad, salario, fecha_ingreso
  file.write(`${id},${nombre},${apellido},${depto},${edad},${salario},${fecha_ingreso}\n`);
}

// Cierra el stream y muestra un mensaje cuando finalice la escritura
file.end(() => console.log('empleados.csv generado'));
