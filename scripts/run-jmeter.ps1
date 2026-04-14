$ErrorActionPreference = "Stop"

$baseUrl = if ($env:BASE_URL) { $env:BASE_URL } else { "http://localhost:4321" }
$testPlan = "tests/performance/jmeter-test-plan.jmx"
$resultsDir = "reports/jmeter"
$resultFile = Join-Path $resultsDir "results.jtl"
$reportDir = Join-Path $resultsDir "html"

if (-not (Get-Command jmeter -ErrorAction SilentlyContinue)) {
  Write-Error "No se encontro JMeter en PATH. Instala Apache JMeter y agrega jmeter.bat/jmeter al PATH."
}

if (-not (Test-Path $resultsDir)) {
  New-Item -Path $resultsDir -ItemType Directory | Out-Null
}

if (Test-Path $reportDir) {
  Remove-Item -Recurse -Force $reportDir
}

Write-Host "Ejecutando JMeter contra $baseUrl ..."

jmeter -n -t $testPlan -JbaseUrl=$baseUrl -l $resultFile -e -o $reportDir

Write-Host "JMeter finalizado."
Write-Host "Resultados: $resultFile"
Write-Host "Reporte HTML: $reportDir/index.html"
