Add-Type -AssemblyName System.Drawing

$bitmap = New-Object System.Drawing.Bitmap(100, 100)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.Clear([System.Drawing.Color]::Blue)
$graphics.DrawString("TEST", (New-Object System.Drawing.Font("Arial", 12)), [System.Drawing.Brushes]::White, 10, 10)
$bitmap.Save("C:\Users\Kevin\Desktop\test-upload.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$graphics.Dispose()
$bitmap.Dispose()
Write-Host "Test image created at C:\Users\Kevin\Desktop\test-upload.jpg"
