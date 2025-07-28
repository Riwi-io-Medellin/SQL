# 🧹 DROP TABLE vs TRUNCATE TABLE en SQL

Este documento explica el uso de las instrucciones `DROP TABLE` y `TRUNCATE TABLE`, así como sus diferencias principales.

---

## 🔸 1. DROP TABLE

La instrucción `DROP TABLE` elimina completamente una tabla de la base de datos, incluyendo su estructura, datos, índices y restricciones.

```sql
DROP TABLE empleados;
```

Una vez ejecutado, **la tabla deja de existir** y no se puede consultar ni recuperar a menos que se vuelva a crear manualmente.

---

## 🔸 2. TRUNCATE TABLE

La instrucción `TRUNCATE TABLE` elimina **todos los registros de una tabla**, pero **mantiene la estructura** para que pueda seguir usándose.

```sql
TRUNCATE TABLE empleados;
```

Después de usar `TRUNCATE`, la tabla está vacía pero sigue existiendo con su definición original.

---

## 🆚 Diferencias clave

| Característica                  | DROP TABLE                    | TRUNCATE TABLE                  |
|-------------------------------|-------------------------------|---------------------------------|
| Elimina estructura de la tabla | ✅ Sí                         | ❌ No                           |
| Elimina los datos              | ✅ Sí                         | ✅ Sí                           |
| Se puede usar la tabla luego   | ❌ No (hay que recrearla)     | ✅ Sí                           |
| Se puede revertir con ROLLBACK | ❌ No (comando DDL)           | ⚠️ Depende del motor de BD     |
| Reinicia el contador AUTO_INCREMENT | ✅ Sí                    | ✅ Sí                           |
| Más rápido que DELETE          | ✅ Sí                         | ✅ Sí                           |
| Activa triggers (disparadores) | ❌ No                         | ⚠️ Depende del motor           |

---

## 📝 Recomendación

- Usa `DROP TABLE` cuando necesites eliminar por completo una tabla.
- Usa `TRUNCATE TABLE` si solo quieres borrar los datos rápidamente, pero conservar la tabla para futuras inserciones.

---

## ⚠️ Advertencia

Ambas instrucciones son **irreversibles** en la mayoría de los casos. Úsalas con precaución, especialmente en entornos de producción.

