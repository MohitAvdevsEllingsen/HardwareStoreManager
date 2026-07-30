package com.hardwarestore.manager.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = Amber500,
    onPrimary = Color.Black,
    primaryContainer = Amber600,
    onPrimaryContainer = Color.White,
    secondary = Sky500,
    onSecondary = Color.Black,
    tertiary = Emerald500,
    background = SurfaceBackground,
    onBackground = TextPrimary,
    surface = SurfaceCard,
    onSurface = TextPrimary,
    error = Rose500
)

@Composable
fun HardwareStoreManagerTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
