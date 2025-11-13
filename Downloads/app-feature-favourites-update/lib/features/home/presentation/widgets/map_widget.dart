import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:tropanartov/features/home/presentation/bloc/home_bloc.dart';
import 'package:tropanartov/features/home/presentation/widgets/map_marker_current_widget.dart';
import 'package:tropanartov/core/widgets/widgets.dart';

class MapWidget extends StatelessWidget {
  final MapController mapController;
  final HomeState state;

  const MapWidget({
    Key? key,
    required this.mapController,
    required this.state,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FlutterMap(
      mapController: mapController,
      options: MapOptions(
        initialCenter: const LatLng(43.49, 43.6189),
        initialZoom: 12.0,
        minZoom: 10.0,
        maxZoom: 18.0,
        // Добавляем обработчик нажатия на карту для закрытия деталей
        onTap: (tapPosition, point) {
          // Закрываем детали места при нажатии на пустую область карты
          if (state.showPlaceDetails) {
            context.read<HomeBloc>().add(const ClosePlaceDetails());
          }
        },
      ),
      children: [
        // Отображение карты
        TileLayer(
          urlTemplate: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
          userAgentPackageName: 'dev.outcasts.tropanartov',
        ),

        // Отрисовка маршрута (если есть) - пунктирная линия
        if (state.routeCoordinates != null && state.routeCoordinates!.isNotEmpty)
          PolylineLayer(
            polylines: [
              Polyline(
                points: state.routeCoordinates!,
                color: const Color(0xFF23A69B),
                strokeWidth: 8.0,
                strokeCap: StrokeCap.round,
                strokeJoin: StrokeJoin.round,
                pattern: StrokePattern.dotted(),
              ),
            ],
          ),

        // Отображение точек на карте
        Builder(
          builder: (context) {
            // Отладочный вывод
            if (state.places.isNotEmpty) {
              final validPlaces = state.places
                  .where((place) =>
                      place.latitude != 0.0 &&
                      place.longitude != 0.0 &&
                      place.latitude.abs() <= 90.0 &&
                      place.longitude.abs() <= 180.0)
                  .toList();
              debugPrint('MapWidget: Всего мест: ${state.places.length}, с валидными координатами: ${validPlaces.length}');
              if (validPlaces.isNotEmpty) {
                debugPrint('MapWidget: Первое место - lat: ${validPlaces.first.latitude}, lng: ${validPlaces.first.longitude}');
              } else if (state.places.isNotEmpty) {
                debugPrint('MapWidget: У всех мест координаты равны 0.0 или невалидны');
                debugPrint('MapWidget: Пример координат первого места - lat: ${state.places.first.latitude}, lng: ${state.places.first.longitude}');
              }
            } else {
              debugPrint('MapWidget: Список мест пуст');
            }

            if (state.places.isNotEmpty) {
              final validPlaces = state.places
                  .where((place) =>
                      place.latitude != 0.0 &&
                      place.longitude != 0.0 &&
                      place.latitude.abs() <= 90.0 &&
                      place.longitude.abs() <= 180.0)
                  .toList();

              if (validPlaces.isEmpty) {
                return const SizedBox.shrink();
              }

              return MarkerLayer(
                markers: validPlaces.map((place) {
                  return Marker(
                    point: LatLng(place.latitude, place.longitude),
                    width: 62.0, // 50px (круг) + 12px (стрелка)
                    height: 59.0, // 50px (круг) + 9px (стрелка)
                    alignment: Alignment.topCenter,
                    child: GestureDetector(
                      onTap: () {
                        context.read<HomeBloc>().add(SelectPlace(place));
                      },
                      child: MapMarker(
                        imageUrl: place.images.isNotEmpty ? place.images.first.url : null,
                        onTap: () {
                          context.read<HomeBloc>().add(SelectPlace(place));
                        },
                      ),
                    ),
                  );
                }).toList(),
              );
            }
            return const SizedBox.shrink();
          },
        ),

        // Текущая геолокация пользователя
        if (state.myLocation != null)
          MarkerLayer(
            markers: [
              Marker(
                point: state.myLocation!,
                width: 120.0,
                height: 120.0,
                child: const CurrentUserPositionWidget(),
              ),
            ],
          ),
      ],
    );
  }
}