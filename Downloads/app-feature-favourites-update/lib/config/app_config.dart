import 'dart:io';

class AppConfig {
  // Базовый URL API
  // Для iOS симулятора используйте: 'http://localhost:8001'
  // Для Android эмулятора используйте: 'http://10.0.2.2:8001'
  // Для реального устройства используйте IP вашего компьютера: 'http://192.168.1.100:8001'
  static String get baseUrl {
    // Автоматически определяем платформу
    if (Platform.isIOS) {
      return 'http://localhost:8001';
    } else if (Platform.isAndroid) {
      return 'http://10.0.2.2:8001';
    } else {
      // Для других платформ используем localhost
      return 'http://localhost:8001';
    }
  }

  // Таймауты для HTTP запросов (в секундах)
  static const Duration connectTimeout = Duration(seconds: 10);
  static const Duration receiveTimeout = Duration(seconds: 60); // Увеличено до 60 секунд
}

// class AppConfig {
//   static String get baseUrl {
//     return 'http://10.0.2.2:8001';
//   }

//   static const Duration connectTimeout = Duration(seconds: 1);
//   static const Duration receiveTimeout = Duration(seconds: 10);
// }