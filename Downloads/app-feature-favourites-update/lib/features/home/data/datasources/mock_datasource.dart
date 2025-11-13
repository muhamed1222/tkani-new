import 'dart:convert';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:permission_handler/permission_handler.dart';
import 'package:tropanartov/features/home/domain/entities/place.dart';
import 'package:tropanartov/shared/domain/entities/review.dart';
import 'package:tropanartov/config/app_config.dart';

// Mock-источник. Здесь mockPoints, но как Place.
class MockDatasource {

  Future<List<Place>> getPlacesFromBackend() async {
    try {
      final baseUrl = AppConfig.baseUrl;
      final response = await http.get(
        Uri.parse('$baseUrl/places'),
      );

      // print('📡 Ответ бекенда: ${response.statusCode}');

      if (response.statusCode == 200) {
        final responseBody = response.body;
        // print('=== PLACES API DEBUG ===');
        // print('Status code: ${response.statusCode}');
        // print('Response body: $responseBody');
        // print('=======================');

        final List<dynamic> data = json.decode(responseBody);
        // print('=== PLACES PARSING DEBUG ===');
        // print('Number of items: ${data.length}');

        if (data.isNotEmpty) {
          final firstItem = data.first;
          firstItem.forEach((key, value) {
            // print('  $key: $value (type: ${value.runtimeType})');
          });

          // final testPlace = Place.fromJson(firstItem);
        }

        final places = <Place>[];
        for (var i = 0; i < data.length; i++) {
          // print('Parsing item: ${data[i]}');
          try {
            final place = Place.fromJson(data[i]);
            // print('Result - ID: ${place.id}, Name: "${place.name}"');
            places.add(place);
          } catch (e) {
            // print('Error parsing place $i: $e');
          }
        }

        // for (var i = 0; i < places.length; i++) {
        //   print('Place $i: ID=${places[i].id}, Name="${places[i].name}"');
        // }

        return places;
      } else {
        throw Exception('Failed to load places from backend: ${response.statusCode}');
      }
    } catch (e) {
      // print('❌ Ошибка загрузки мест с бекенда: $e');
      return [];
    }
  }

  // Временный метод для отправки отзыва на бекенд
  Future<void> submitReviewToBackend(int placeId, int rating, String text) async {
    try {
      final baseUrl = AppConfig.baseUrl;
      final response = await http.post(
        Uri.parse('$baseUrl/reviews'),
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer $token', // Добавить когда будет авторизация
        },
        body: json.encode({
          'place_id': placeId,
          'rating': rating,
          'text': text,
        }),
      );

      if (response.statusCode == 201) {
      } else {
        throw Exception('Failed to submit review: ${response.statusCode}');
      }
    } catch (e) {
      // print('❌ Ошибка отправки отзыва: $e');
      // throw e;
    }
  }

  // Временный метод для получения отзывов с бекенда
  Future<List<Review>> getReviewsFromBackend(int placeId) async {
    try {
      final baseUrl = AppConfig.baseUrl;
      final response = await http.get(
        Uri.parse('$baseUrl/reviews/place/$placeId'),
      );


      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);

        final reviews = data.map((json) => Review.fromJson(json)).toList();
        return reviews;
      } else {
        throw Exception('Failed to load reviews from backend: ${response.statusCode}');
      }
    } catch (e) {
      // print('❌ Ошибка загрузки отзывов с бекенда: $e');
      return [];
    }
  }

  // Получить места
  static Future<List<Place>> getPlaces() async {
    try {
      final baseUrl = AppConfig.baseUrl;
      final response = await http.get(Uri.parse('$baseUrl/places'));

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => Place.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load places: ${response.statusCode}');
      }
    } catch (e) {
      // print('Error in ApiService.getPlaces: $e');
      return [];
    }
  }

  // Получить позицию
  Future<Position?> getCurrentPosition() async {
    PermissionStatus status = await Permission.location.status;
    if (status != PermissionStatus.granted) {
      status = await Permission.location.request();
    }
    if (status.isGranted) {
      return await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      );
    }
    return null;
  }
}