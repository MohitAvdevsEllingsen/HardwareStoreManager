package com.hardwarestore.manager.data

object AppConfig {
    // Live Cloudflare HTTPS Server URL connected to MongoDB Atlas
    const val LIVE_SERVER_URL = "https://isaac-layers-strips-section.trycloudflare.com/api"

    // Active Server URL
    var BASE_URL = LIVE_SERVER_URL
}
