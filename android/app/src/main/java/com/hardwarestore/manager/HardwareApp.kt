package com.hardwarestore.manager

import android.app.Application
import com.hardwarestore.manager.data.db.AppDatabase
import com.hardwarestore.manager.data.repository.HardwareRepository

class HardwareApp : Application() {
    val database by lazy { AppDatabase.getDatabase(this) }
    val repository by lazy { HardwareRepository(database.customerDao(), database.transactionDao()) }
}
