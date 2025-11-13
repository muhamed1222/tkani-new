import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/svg.dart';
import '../../../models/api_models.dart' hide Image;
import '../../../services/api_service.dart';
import '../../../utils/smooth_border_radius.dart';
import '../../../core/constants/app_design_system.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/widgets/widgets.dart';
import 'routes_filter_widget.dart';

class RoutesMainWidget extends StatefulWidget {
  const RoutesMainWidget({super.key, this.scrollController});

  final ScrollController? scrollController;



  @override
  State<RoutesMainWidget> createState() => _RoutesMainWidgetState();
}

class _RoutesMainWidgetState extends State<RoutesMainWidget> {
  static const sortingItems = ['Сначала популярные', 'Сначала с высоким рейтингом', 'Сначала новые'];
  String sortingValue = sortingItems.first;
  final Map<int, List<String>> _routeImages = {};
  List<AppRoute> _routes = [];
  List<AppRoute> _filteredRoutes = [];
  bool _isLoading = true;
  bool _hasError = false;

  // Состояние фильтров
  RouteFilters _currentFilters = const RouteFilters();

  // Map для хранения состояния избранного для каждого маршрута
  final Map<int, bool> _favoriteStatus = {};


  // Контроллер для поиска
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadRoutes();

    // Устанавливаем светлый status bar при открытии
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    // Восстанавливаем темный status bar при закрытии
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        statusBarBrightness: Brightness.light,
      ),
    );
    super.dispose();
  }

  Future<void> _loadRoutes() async {
    try {
      setState(() {
        _isLoading = true;
        _hasError = false;
      });

      final routes = await ApiService.getRoutes();

      // Инициализируем статусы избранного
      for (var route in routes) {
        _favoriteStatus[route.id] = false; // По умолчанию не в избранном
      }

      // Загружаем изображения для маршрутов
      await _loadRouteImages(routes);

      setState(() {
        _routes = routes;
        _filteredRoutes = _applyFiltersAndSorting(routes);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _hasError = true;
      });
    }
  }

// Исправленный метод для загрузки изображений маршрутов
  Future<void> _loadRouteImages(List<AppRoute> routes) async {
    for (int i = 0; i < routes.length; i++) {
      final route = routes[i];
      try {
        final places = await ApiService.getPlaces();

        if (places.isNotEmpty) {
          final firstPlace = places.first;
          // Преобразуем List<Image> в List<String> (URL строки)
          final imageUrls = firstPlace.images.map((image) => image.url).toList();
          _routeImages[route.id] = imageUrls;
        } else {
          _routeImages[route.id] = [];
        }
      } catch (e) {
        _routeImages[route.id] = [];
        print('Ошибка при загрузке изображения для маршрута ${route.id}: $e');
      }
    }
  }

// Исправленный метод для получения URL изображения маршрута
  String _getRouteImageUrl(AppRoute route) {
    final images = _routeImages[route.id];
    if (images != null && images.isNotEmpty) {
      return images.first; // Возвращаем первую картинку из списка
    }
    return ''; // Возвращаем пустую строку если нет изображений
  }

  // Метод для переключения избранного (без функционала, только визуал)
  void _toggleFavorite(int routeId) {
    setState(() {
      _favoriteStatus[routeId] = !(_favoriteStatus[routeId] ?? false);
    });
  }

  List<AppRoute> _applyFiltersAndSorting(List<AppRoute> routes) {
    // Сначала применяем фильтры
    List<AppRoute> filteredRoutes = _applyFilters(routes);

    // Затем применяем сортировку
    return _applySorting(filteredRoutes, sortingValue);
  }

  List<AppRoute> _applyFilters(List<AppRoute> routes) {
    return routes.where((route) {
      // Фильтр по типу маршрута
      if (_currentFilters.selectedTypes.isNotEmpty) {}

      // Фильтр по дистанции
      if (route.distance < _currentFilters.minDistance || route.distance > _currentFilters.maxDistance) {
        return false;
      }

      return true;
    }).toList();
  }

  List<AppRoute> _applySorting(List<AppRoute> routes, String sortType) {
    List<AppRoute> sortedRoutes = List.from(routes);

    switch (sortType) {
      case 'Сначала популярные':
        sortedRoutes.sort((a, b) => b.rating.compareTo(a.rating));
        break;

      case 'Сначала с высоким рейтингом':
        sortedRoutes.sort((a, b) => b.rating.compareTo(a.rating));
        break;

      case 'Сначала новые':
        sortedRoutes.sort((a, b) => b.createdAt.compareTo(a.createdAt));
        break;

      case 'Рандомный порядок':
        sortedRoutes.shuffle();
        break;

      default:
        break;
    }

    return sortedRoutes;
  }

  void _onSortingChanged(String newValue) {
    setState(() {
      sortingValue = newValue;
      _filteredRoutes = _applyFiltersAndSorting(_routes);
    });
  }

  void _shuffleRandom() {
    setState(() {
      _filteredRoutes = _applySorting(_filteredRoutes, 'Рандомный порядок');
    });
  }

  void _openRouteFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppDesignSystem.textColorPrimary.withValues(alpha: 0.5),
      builder:
          (context) => DraggableScrollableSheet(
        initialChildSize: 0.9,
        minChildSize: 0.0,
        maxChildSize: 0.9,
        expand: false,
        builder:
            (context, scrollController) => RoutesFilterWidget(
          initialFilters: _currentFilters,
          scrollController: scrollController,
          onFiltersApplied: (RouteFilters newFilters) {
            setState(() {
              _currentFilters = newFilters;
              _filteredRoutes = _applyFiltersAndSorting(_routes);
            });
          },
        ),
      ),
    );
  }

  void _onRouteTap(AppRoute route) {
    // print('Нажал на маршрут: ${route.name}');
  }

  // Удалить конкретный тип маршрута
  void _removeRouteType(String type) {
    setState(() {
      final newSelectedTypes = List<String>.from(_currentFilters.selectedTypes);
      newSelectedTypes.remove(type);
      _currentFilters = _currentFilters.copyWith(selectedTypes: newSelectedTypes);
      _filteredRoutes = _applyFiltersAndSorting(_routes);
    });
  }

  // Сбросить фильтр дистанции
  void _resetDistanceFilter() {
    setState(() {
      _currentFilters = _currentFilters.copyWith(
        minDistance: 1.0,
        maxDistance: 30.0,
      );
      _filteredRoutes = _applyFiltersAndSorting(_routes);
    });
  }

  // Виджет для чипса типа маршрута
  Widget _buildRouteTypeChip(String type) {
    return AppFilterChip(
      label: type,
      onDelete: () => _removeRouteType(type),
    );
  }

  // Виджет для чипса дистанции
  Widget _buildDistanceChip() {
    return AppFilterChip(
      label: '${_currentFilters.minDistance.toInt()}-${_currentFilters.maxDistance.toInt()} км',
      onDelete: _resetDistanceFilter,
    );
  }

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      controller: widget.scrollController,
      physics: const ClampingScrollPhysics(),
      slivers: [
        // ЗАФИКСИРОВАННЫЙ ВЕРХНИЙ БЛОК
        SliverAppBar(
          pinned: true,
          floating: false,
          elevation: 0,
          surfaceTintColor: Colors.transparent,
          backgroundColor: AppDesignSystem.backgroundColor,
          automaticallyImplyLeading: false,
          expandedHeight: 0,
          toolbarHeight: _calculateFixedBlockHeight(),
          flexibleSpace: Container(
            color: AppDesignSystem.backgroundColor,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Индикатор перетаскивания
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: DragIndicator(
                    color: AppDesignSystem.handleBarColor,
                    padding: EdgeInsets.zero,
                  ),
                ),

                // Заголовок
                Padding(
                  padding: const EdgeInsets.only(top: 26, bottom: 28),
                  child: Text('Маршруты', style: AppTextStyles.title(fontWeight: AppDesignSystem.fontWeightBold)),
                ),

                // Поиск и фильтрация
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppDesignSystem.paddingHorizontal),
                  child: AppSearchField(
                    controller: _searchController,
                    hint: 'Поиск маршрутов',
                    onFilterTap: _openRouteFilterSheet,
                  ),
                ),
                SizedBox(height: AppDesignSystem.spacingMedium),

                // Показываем активные фильтры как отдельные чипсы
                if (_currentFilters.hasActiveFilters)
                  Padding(
                    padding: const EdgeInsets.only(bottom: AppDesignSystem.spacingMedium),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: AppDesignSystem.paddingHorizontal, vertical: AppDesignSystem.spacingSmall),
                      child: Wrap(
                        spacing: 8,
                        runSpacing: 4,
                        children: [
                          // Чипсы для типов маршрутов
                          ..._currentFilters.selectedTypes.map(_buildRouteTypeChip),

                          // Чипс для дистанции (если отличается от стандартной)
                          if (_currentFilters.minDistance > 1.0 || _currentFilters.maxDistance < 30.0) _buildDistanceChip(),
                        ],
                      ),
                    ),
                  ),

                // Сортировка
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppDesignSystem.paddingHorizontal),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      MenuAnchor(
                        style: MenuStyle(
                          padding: WidgetStatePropertyAll(EdgeInsets.all(AppDesignSystem.spacingMedium)),
                          backgroundColor: WidgetStatePropertyAll(AppDesignSystem.backgroundColor),
                          elevation: WidgetStatePropertyAll(0),
                          shadowColor: WidgetStatePropertyAll(Colors.transparent),
                          shape: WidgetStatePropertyAll(RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppDesignSystem.borderRadius))),
                        ),
                        builder:
                            (context, controller, child) => IconButton(
                          icon: Row(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.start,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            spacing: AppDesignSystem.spacingTiny + 2,
                            children: [
                              Text(
                                sortingValue,
                                style: AppTextStyles.small(
                                  color: AppDesignSystem.textColorSecondary,
                                ),
                              ),
                              SvgPicture.asset(
                                'assets/V.svg',
                                width: 4,
                                height: 8,
                                fit: BoxFit.contain,
                              ),
                            ],
                          ),
                          onPressed: () => controller.isOpen ? controller.close() : controller.open(),
                        ),
                        menuChildren:
                        sortingItems
                            .map(
                              (e) => MenuItemButton(
                            onPressed: () {
                              _onSortingChanged(e);
                            },
                            child: Text(e),
                          ),
                        )
                            .toList(),
                      ),
                      GestureDetector(
                        onTap: _shuffleRandom,
                        child: SmoothContainer(
                          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
                          borderRadius: AppDesignSystem.borderRadius,
                          color: AppDesignSystem.greyLight,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              SvgPicture.asset(
                                'assets/random.svg',
                                width: 16,
                                height: 16,
                                fit: BoxFit.contain,
                              ),
                              const SizedBox(width: 5),
                              Text(
                                'Рандом',
                                style: AppTextStyles.small(),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),

        SliverToBoxAdapter(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (_isLoading)
                Padding(
                  padding: const EdgeInsets.all(0),
                  child: CircularProgressIndicator(),
                ),

              if (_hasError)
                Padding(
                  padding: const EdgeInsets.all(0),
                  child: Column(
                    children: [
                      Text('Ошибка загрузки маршрутов'),
                      SizedBox(height: 10),
                      PrimaryButton(
                        text: 'Попробовать снова',
                        onPressed: _loadRoutes,
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),

        if (!_isLoading && !_hasError && _filteredRoutes.isNotEmpty)
          SliverGrid(
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 171 / 260,
            ),
            delegate: SliverChildBuilderDelegate(
                  (context, index) {
                final route = _filteredRoutes[index];
                final isFavorite = _favoriteStatus[route.id] ?? false;
                final imageUrl = _getRouteImageUrl(route);

                return GestureDetector(
                  onTap: () => _onRouteTap(route),
                  child: Column(
                    children: [
                      // Карточка с изображением - ФОТО ЗАНИМАЕТ ВСЁ ПРОСТРАНСТВО
                      Container(
                        width: AppDesignSystem.cardWidth,
                        height: 220,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(AppDesignSystem.borderRadius),
                          color: imageUrl.isEmpty ? AppDesignSystem.primaryColor : Colors.transparent,
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(AppDesignSystem.borderRadius),
                          child: Stack(
                            children: [
                              // Фоновая картинка маршрута на ВСЁ ПРОСТРАНСТВО
                              if (imageUrl.isNotEmpty)
                                Image.network(
                                  imageUrl,
                                  width: double.infinity,
                                  height: double.infinity,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Container(
                                      color: AppDesignSystem.blackColor,
                                    );
                                  },
                                )
                              else
                                Container(
                                  color: AppDesignSystem.primaryColor,
                                ),

                              // Градиент для лучшей читаемости текста
                              Container(
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(AppDesignSystem.borderRadius),
                                  gradient: LinearGradient(
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                    colors: [
                                      Colors.transparent,
                                      Colors.transparent,
                                      Colors.black.withOpacity(0.6),
                                    ],
                                  ),
                                ),
                              ),

                              // Верхняя часть - кнопка избранного
                              Positioned(
                                top: 10,
                                left: 10,
                                child: FavoriteButton(
                                  isFavorite: isFavorite,
                                  onTap: () => _toggleFavorite(route.id),
                                ),
                              ),

                              // Тип маршрута и протяженность (из route)
                              Positioned(
                                bottom: AppDesignSystem.spacingMedium - 2,
                                left: AppDesignSystem.spacingSmall + 2,
                                right: AppDesignSystem.spacingSmall + 2,
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        // Тип маршрута (из route)
                                        ClipPath(
                                          clipper: SmoothBorderClipper(radius: AppDesignSystem.borderRadiusXXLarge),
                                          child: BackdropFilter(
                                            filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
                                            child: SmoothContainer(
                                              padding: const EdgeInsets.symmetric(
                                                horizontal: AppDesignSystem.spacingSmall,
                                                vertical: AppDesignSystem.spacingTiny,
                                              ),
                                              borderRadius: AppDesignSystem.borderRadiusXXLarge,
                                              color: AppDesignSystem.textColorWhite.withValues(alpha: 0.2),
                                              child: Text(
                                                route.typeName.toString(),
                                                style: AppTextStyles.error(
                                                  color: AppDesignSystem.textColorWhite,
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),

                                        SizedBox(width: AppDesignSystem.spacingTiny),

                                        // Протяженность маршрута (из route)
                                        ClipRRect(
                                          borderRadius: BorderRadius.circular(AppDesignSystem.borderRadiusXXLarge),
                                          child: BackdropFilter(
                                            filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
                                            child: Container(
                                              padding: const EdgeInsets.symmetric(
                                                horizontal: AppDesignSystem.spacingSmall,
                                                vertical: AppDesignSystem.spacingTiny,
                                              ),
                                              decoration: BoxDecoration(
                                                borderRadius: BorderRadius.circular(AppDesignSystem.borderRadiusXXLarge),
                                                color: AppDesignSystem.textColorWhite.withValues(alpha: 0.2),
                                              ),
                                              child: Text(
                                                '${route.distance.toInt()} км',
                                                style: AppTextStyles.error(
                                                  color: AppDesignSystem.textColorWhite,
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      SizedBox(height: AppDesignSystem.spacingSmall),

                      // Текст под карточкой (все данные из route)
                      Container(
                        width: AppDesignSystem.cardMinHeight,
                        padding: const EdgeInsets.symmetric(horizontal: AppDesignSystem.spacingTiny),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Название маршрута (из route)
                            Text(
                              route.name,
                              style: AppTextStyles.small(
                                fontWeight: AppDesignSystem.fontWeightSemiBold,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),

                            SizedBox(height: AppDesignSystem.spacingTiny),

                            // Описание маршрута (из route)
                            Text(
                              route.description,
                              style: AppTextStyles.error(
                                color: AppDesignSystem.textColorSecondary,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
              childCount: _filteredRoutes.length,
            ),
          ),
        if (!_isLoading && !_hasError && _filteredRoutes.isEmpty)
          SliverFillRemaining(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.route, size: 60, color: AppDesignSystem.greyMedium),
                  SizedBox(height: AppDesignSystem.spacingLarge),
                  Text(
                    _currentFilters.hasActiveFilters ? 'Маршруты не найдены по выбранным фильтрам' : 'Маршруты не найдены',
                    style: AppTextStyles.body(
                      color: AppDesignSystem.greyMedium,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: AppDesignSystem.spacingSmall + 2),
                  if (_currentFilters.hasActiveFilters)
                    PrimaryButton(
                      text: 'Сбросить все фильтры',
                      onPressed: () {
                        setState(() {
                          _currentFilters = const RouteFilters();
                          _filteredRoutes = _applyFiltersAndSorting(_routes);
                        });
                      },
                    )
                  else
                    PrimaryButton(
                      text: 'Обновить',
                      onPressed: _loadRoutes,
                    ),
                ],
              ),
            ),
          ),

        // Нижний отступ
        SliverPadding(
          padding: const EdgeInsets.only(bottom: 44),
        ),
      ],
    );
  }

  // Метод для расчета высоты фиксированного блока
  double _calculateFixedBlockHeight() {
    double height = 200;

    // Добавляем высоту для активных фильтров если есть
    if (_currentFilters.hasActiveFilters) {
      height += 12 + 82; // отступ + высота чипсов (увеличен запас для многорядных чипсов)
    }

    return height;
  }
}