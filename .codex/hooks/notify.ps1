$ErrorActionPreference = 'Stop'
[Console]::In.ReadToEnd() | Out-Null
$notification = $null
try {
  Add-Type -AssemblyName System.Windows.Forms
  Add-Type -AssemblyName System.Drawing
  $notification = New-Object System.Windows.Forms.NotifyIcon
  $notification.Icon = [System.Drawing.SystemIcons]::Information
  $notification.Text = 'Codex'
  $notification.BalloonTipTitle = 'Codex'
  $notification.BalloonTipText = 'Всё готово, мой босс'
  $notification.Visible = $true
  $notification.ShowBalloonTip(5000)
  $until = [DateTime]::UtcNow.AddSeconds(6)
  while ([DateTime]::UtcNow -lt $until) {
    [System.Windows.Forms.Application]::DoEvents()
    Start-Sleep -Milliseconds 100
  }
} catch {
  [Console]::Error.WriteLine($_.Exception.Message)
  exit 1
} finally {
  if ($null -ne $notification) {
    $notification.Dispose()
  }
}
[Console]::Out.WriteLine('{}')
