$sql = Get-Content 'schemas/sqlserver_schema.sql' -Raw

# Comment out CREATE SCHEMA dbo (always exists in SQL Server)
$sql = $sql -replace 'CREATE SCHEMA dbo;', '-- CREATE SCHEMA dbo (already exists)'

# Fix unquoted reserved keyword: Case is a T-SQL reserved word — mssql-scripter omits brackets in CREATE INDEX ON clauses
$sql = $sql -replace 'ON WOVO\.dbo\.Case ', 'ON WOVO.dbo.[Case] '

# Remove null; stubs — mssql-scripter emits these for views it cannot export
$sql = $sql -replace '(?m)^null;\s*$', ''

# Add GO after EVERY line ending with ; so each statement is its own batch.
# This fixes the WITH-as-CTE parsing ambiguity when CREATE INDEX ... WITH (...)
# follows another statement in the same batch.
$sql = $sql -replace '(;[ \t]*)\r?\n', ";`r`nGO`r`n"

# Remove duplicate GO lines (in case ); already had GO added)
$sql = $sql -replace '(GO\r?\n){2,}', "GO`r`n"

[System.IO.File]::WriteAllText("$PWD\init\sqlserver\01_schema.sql", $sql, [System.Text.UTF8Encoding]::new($false))
$lineCount = (Get-Content 'init/sqlserver/01_schema.sql').Count
Write-Host "Done: $lineCount lines"
