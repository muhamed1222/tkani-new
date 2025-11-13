import 'package:flutter/foundation.dart';
import 'dart:io';

/// Конфигурация API для разных окружений
class ApiConfig {
  /// Базовый URL API
  /// 
  /// Автоматически выбирается в зависимости от платформы:
  /// - iOS симулятор: localhost
  /// - Android эмулятор: 10.0.2.2
  /// - Реальное устройство: нужно указать IP адрес компьютера в локальной сети
  static String get baseUrl {
    if (kDebugMode) {
      // В режиме разработки
      if (Platform.isIOS) {
        // iOS симулятор использует localhost
        return 'http://localhost:8001';
      } else if (Platform.isAndroid) {
        // Android эмулятор использует специальный адрес
        return 'http://10.0.2.2:8001';
      }
    }
    
    // Для production или реальных устройств
    // TODO: Замените на реальный URL вашего сервера
    return 'http://localhost:8001';
  }
  
  /// Timeout для HTTP запросов (в секундах)
  static const Duration requestTimeout = Duration(seconds: 10);
  
  /// Timeout для запросов, которые могут занять больше времени (например, загрузка файлов)
  static const Duration longRequestTimeout = Duration(seconds: 30);
}

