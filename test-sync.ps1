# Script de Prueba: Sincronización Completa
# Este script prueba todo el flujo de extracción y guardado de datos

Write-Host "🧪 SCRIPT DE PRUEBA - SIGE INTEGRATION" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$API_BASE_URL = "http://localhost:4321"
$EXTRACT_API = "$API_BASE_URL/api/sige/extract-data"
$SAVE_API = "$API_BASE_URL/api/sige/save-to-db"

# Solicitar datos al usuario
Write-Host "📝 Ingresa los siguientes datos:" -ForegroundColor Yellow
Write-Host ""

$PHPSESSID = Read-Host "Cookie PHPSESSID"
$MATRICULA = Read-Host "Matrícula (opcional)"

Write-Host ""
Write-Host "🔍 Validando datos..." -ForegroundColor Cyan

if ([string]::IsNullOrWhiteSpace($PHPSESSID)) {
    Write-Host "❌ Error: PHPSESSID es requerido" -ForegroundColor Red
    exit 1
}

if ($PHPSESSID.Length -lt 10) {
    Write-Host "⚠️ Advertencia: PHPSESSID parece muy corto" -ForegroundColor Yellow
}

Write-Host "✅ Datos validados" -ForegroundColor Green
Write-Host ""

# ==========================================
# PASO 1: Extraer datos del SIGE
# ==========================================
Write-Host "📊 PASO 1: Extrayendo datos del SIGE..." -ForegroundColor Cyan
Write-Host "Endpoint: $EXTRACT_API" -ForegroundColor Gray

$bodyExtract = @{
    phpsessid = $PHPSESSID
} | ConvertTo-Json

if (![string]::IsNullOrWhiteSpace($MATRICULA)) {
    $bodyExtract = @{
        phpsessid = $PHPSESSID
        matricula = $MATRICULA
    } | ConvertTo-Json
}

try {
    $responseExtract = Invoke-RestMethod `
        -Uri $EXTRACT_API `
        -Method POST `
        -ContentType "application/json" `
        -Body $bodyExtract `
        -TimeoutSec 60

    if ($responseExtract.success) {
        Write-Host "✅ Datos extraídos exitosamente!" -ForegroundColor Green
        Write-Host ""
        
        # Mostrar resumen
        $datos = $responseExtract.data.datosPersonales
        $historial = $responseExtract.data.historialAcademico
        $calificaciones = $responseExtract.data.calificacionesActuales
        $adeudos = $responseExtract.data.adeudos
        
        Write-Host "👤 DATOS PERSONALES:" -ForegroundColor Yellow
        Write-Host "   Nombre: $($datos.nombre) $($datos.apPaterno) $($datos.apMaterno)"
        Write-Host "   Matrícula: $($responseExtract.matricula)"
        Write-Host "   CURP: $($datos.curp)"
        Write-Host "   Email: $($datos.email)"
        Write-Host "   Celular: $($datos.celular)"
        Write-Host "   Carrera: $($datos.carrera)"
        Write-Host "   Cuatrimestre: $($datos.cuatrimestre)"
        Write-Host ""
        
        Write-Host "📚 HISTORIAL ACADÉMICO:" -ForegroundColor Yellow
        Write-Host "   Total de materias: $($historial.materias.Count)"
        Write-Host "   Promedio: $($historial.promedio)"
        Write-Host "   Créditos cursados: $($historial.creditosCursados)"
        Write-Host "   Créditos totales: $($historial.creditosTotales)"
        
        if ($historial.materias.Count -gt 0) {
            Write-Host ""
            Write-Host "   Últimas 3 materias:" -ForegroundColor Gray
            $historial.materias | Select-Object -First 3 | ForEach-Object {
                Write-Host "      - $($_.nombre): $($_.calificacion) ($($_.periodo))" -ForegroundColor Gray
            }
        }
        Write-Host ""
        
        Write-Host "📊 CALIFICACIONES ACTUALES:" -ForegroundColor Yellow
        Write-Host "   Total: $($calificaciones.Count)"
        if ($calificaciones.Count -gt 0) {
            $calificaciones | ForEach-Object {
                Write-Host "      - $($_.nombre): $($_.calificacion)" -ForegroundColor Gray
            }
        }
        Write-Host ""
        
        Write-Host "💰 ADEUDOS:" -ForegroundColor Yellow
        Write-Host "   Total: $($adeudos.Count)"
        if ($adeudos.Count -gt 0) {
            $adeudos | ForEach-Object {
                Write-Host "      - $($_.concepto): $($_.monto) - $($_.estado)" -ForegroundColor $(if ($_.estado -eq "Pendiente") { "Red" } else { "Gray" })
            }
        }
        Write-Host ""
        
        # Guardar matrícula para el siguiente paso
        $MATRICULA = $responseExtract.matricula
        
    } else {
        Write-Host "❌ Error: No se pudieron extraer los datos" -ForegroundColor Red
        Write-Host "Respuesta: $($responseExtract | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
        exit 1
    }
    
} catch {
    Write-Host "❌ Error en la petición de extracción:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Detalles: $responseBody" -ForegroundColor Gray
    }
    
    exit 1
}

# ==========================================
# PASO 2: Guardar en Base de Datos
# ==========================================
Write-Host ""
Write-Host "💾 PASO 2: Guardando en base de datos..." -ForegroundColor Cyan
Write-Host "Endpoint: $SAVE_API" -ForegroundColor Gray

$bodySave = @{
    data = $responseExtract.data
    matricula = $MATRICULA
} | ConvertTo-Json -Depth 10

try {
    $responseSave = Invoke-RestMethod `
        -Uri $SAVE_API `
        -Method POST `
        -ContentType "application/json" `
        -Body $bodySave `
        -TimeoutSec 60

    if ($responseSave.success) {
        Write-Host "✅ Datos guardados exitosamente!" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "📋 RESUMEN GUARDADO:" -ForegroundColor Yellow
        Write-Host "   Estudiante: $($responseSave.estudiante.nombre)"
        Write-Host "   Matrícula: $($responseSave.estudiante.matricula)"
        Write-Host "   Materias guardadas: $($responseSave.resumen.materias)"
        Write-Host "   Calificaciones guardadas: $($responseSave.resumen.calificaciones)"
        Write-Host "   Adeudos guardados: $($responseSave.resumen.adeudos)"
        Write-Host ""
        
    } else {
        Write-Host "❌ Error: No se pudieron guardar los datos" -ForegroundColor Red
        Write-Host "Respuesta: $($responseSave | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
        exit 1
    }
    
} catch {
    Write-Host "❌ Error en la petición de guardado:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Detalles: $responseBody" -ForegroundColor Gray
    }
    
    exit 1
}

# ==========================================
# FIN
# ==========================================
Write-Host ""
Write-Host "🎉 ¡SINCRONIZACIÓN COMPLETA!" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Los datos se extrajeron del SIGE" -ForegroundColor Green
Write-Host "✅ Los datos se guardaron en Supabase" -ForegroundColor Green
Write-Host ""
Write-Host "👉 Ahora puedes ver los datos en tu aplicación" -ForegroundColor Yellow
Write-Host ""

# Opcional: Abrir el navegador
$openBrowser = Read-Host "¿Deseas abrir la aplicación en el navegador? (s/n)"
if ($openBrowser -eq "s" -or $openBrowser -eq "S") {
    Start-Process $API_BASE_URL
}
