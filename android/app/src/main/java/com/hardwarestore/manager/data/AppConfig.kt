package com.hardwarestore.manager.data

object AppConfig {
    // Local Dev URL
    const val LOCAL_API_URL = "http://10.0.2.2:5000/api"

    // Render Hosted Server URL (Replace with your Render web service URL after deployment)
    const val RENDER_HOSTED_API_URL = "https://hardware-store-manager.onrender.com/api"

    // Active Server URL
    var BASE_URL = RENDER_HOSTED_API_URL
}
