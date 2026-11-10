package com.example.geruestmeister.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = OrangePrimary,
    onPrimary = SlateLightCard,
    primaryContainer = OrangeLight,
    onPrimaryContainer = OrangeDark,
    secondary = SlateDark,
    onSecondary = SlateLightCard,
    secondaryContainer = SlateLightBorder,
    onSecondaryContainer = SlateTextPrimary,
    background = SlateLightBg,
    onBackground = SlateTextPrimary,
    surface = SlateLightCard,
    onSurface = SlateTextPrimary,
    surfaceVariant = SlateLightBorder,
    onSurfaceVariant = SlateTextSecondary,
    outline = SlateLightBorder
)

private val DarkColorScheme = darkColorScheme(
    primary = OrangePrimary,
    onPrimary = SlateDark,
    primaryContainer = SlateBorderDark,
    onPrimaryContainer = OrangeLight,
    secondary = SlateLightCard,
    onSecondary = SlateDark,
    secondaryContainer = SlateCardDark,
    onSecondaryContainer = SlateLightCard,
    background = SlateDark,
    onBackground = SlateLightCard,
    surface = SlateCardDark,
    onSurface = SlateLightCard,
    surfaceVariant = SlateBorderDark,
    onSurfaceVariant = SlateTextSecondary,
    outline = SlateBorderDark
)

@Composable
fun GeruestMeisterTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
