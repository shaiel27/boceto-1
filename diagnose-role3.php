<?php
// Script de diagnóstico para usuarios de rol 3
echo "<h2>Diagnóstico de Usuarios Rol 3 (Jefes)</h2>";

// Verificar estructura de tablas
echo "<h3>1. Estructura de Tablas</h3>";
$tables = [
    'Users' => ['ID_Users', 'Email', 'Full_Name', 'Fk_Role', 'created_at'],
    'Role' => ['ID_Role', 'Role'],
    'Boss' => ['ID_Boss', 'Name_Boss', 'Fk_User', 'Fk_Office'],
    'Office' => ['ID_Office', 'Name_Office', 'Office_Type']
];

foreach ($tables as $table => $expectedColumns) {
    echo "<h4>Tabla: $table</h4>";
    echo "<p>Columnas esperadas: " . implode(', ', $expectedColumns) . "</p>";
}

// Consulta SQL esperada
echo "<h3>2. Consulta SQL para obtener datos de usuario</h3>";
$expectedQuery = "SELECT u.ID_Users, u.Full_Name, u.Email, u.created_at,
                         b.Fk_Office as office_id,
                         o.Name_Office as office_name,
                         o.Office_Type as office_type,
                         r.Role as role_name
                  FROM Users u
                  LEFT JOIN Boss b ON u.ID_Users = b.Fk_User
                  LEFT JOIN Office o ON b.Fk_Office = o.ID_Office
                  LEFT JOIN Role r ON u.Fk_Role = r.ID_Role
                  WHERE u.ID_Users = :id";

echo "<pre>$expectedQuery</pre>";

echo "<h3>3. Posibles Problemas</h3>";
echo "<ul>";
echo "<li>Los usuarios de rol 3 pueden no tener registro en la tabla Boss</li>";
echo "<li>El JOIN LEFT puede no estar trayendo los datos de oficina correctamente</li>";
echo "<li>El campo Fk_Office en Boss puede estar apuntando a una oficina incorrecta</li>";
echo "</ul>";

echo "<h3>4. Solución Sugerida</h3>";
echo "<p>Modificar la consulta para usar el JOIN correcto según la estructura real de la base de datos.</p>";

echo "<h3>5. Verificación Manual</h3>";
echo "<p>Ejecutar estas consultas en phpMyAdmin o MySQL Workbench:</p>";
echo "<pre>";
echo "-- Ver usuarios de rol 3
SELECT u.ID_Users, u.Email, u.Full_Name, u.Fk_Role, r.Role
FROM Users u
JOIN Role r ON u.Fk_Role = r.ID_Role
WHERE u.Fk_Role = 3;

-- Ver si tienen registro en Boss
SELECT b.ID_Boss, b.Fk_User, b.Fk_Office, o.Name_Office
FROM Boss b
LEFT JOIN Office o ON b.Fk_Office = o.ID_Office
WHERE b.Fk_User IN (SELECT ID_Users FROM Users WHERE Fk_Role = 3);
</pre>";
?>
