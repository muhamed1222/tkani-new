import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/constants/app_design_system.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/widgets/widgets.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../../../models/api_models.dart';
import '../../../../services/api_service.dart';
import '../../../../services/auth_service.dart';
import '../../../../shared/data/datasources/mock_place_areas_for_place.dart';
import '../../../../shared/data/datasources/mock_place_categories_for_place.dart';
import '../../../../shared/data/datasources/mock_place_tags_for_place.dart';
import '../../../../utils/smooth_border_radius.dart';
import 'places_filter_widget.dart';

class PlacesMainWidget extends StatefulWidget {
  const PlacesMainWidget({
    super.key,
    this.scrollController,
    this.initialSearchQuery,
  });

  final ScrollController? scrollController;
  final String? initialSearchQuery;

  @override
  State<PlacesMainWidget> createState() => _PlacesMainWidgetState();
}

class _PlacesMainWidgetState extends State<PlacesMainWidget> {
  static const sortingItems = [
    'Сначала популярные',
    'Сначала с высоким рейтингом',
    'Сначала новые',
  ];
  String sortingValue = sortingItems.first;

  List<Place> _places = [];
  List<Place> _filteredPlaces = [];
  bool _isLoading = true;
  bool _hasError = false;

  // Состояние фильтров
  PlaceFilters _currentFilters = const PlaceFilters();

  // Состояние поиска
  late TextEditingController _searchController;
  String _searchQuery = '';

  // Map для хранения состояния избранного для каждого места
  final Map<int, bool> _favoriteStatus = {};

  @override
  void initState() {
    super.initState();
    _searchQuery = widget.initialSearchQuery ?? '';
    _searchController = TextEditingController(text: _searchQuery);
    _loadPlaces();

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

  Future<void> _loadPlaces() async {
    try {
      setState(() {
        _isLoading = true;
        _hasError = false;
      });

      final places = await ApiService.getPlaces();

      // Загружаем статусы избранного для всех мест
      await _loadFavoriteStatuses(places);

      setState(() {
        _places = places;
        _filteredPlaces = _applyFiltersAndSorting(places);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _hasError = true;
      });
    }
  }

  // Метод для загрузки статусов избранного
  Future<void> _loadFavoriteStatuses(List<Place> places) async {
    final token = await AuthService.getToken();
    if (token == null) return;

    for (final place in places) {
      try {
        final isFavorite = await ApiService.isPlaceFavorite(place.id, token);
        _favoriteStatus[place.id] = isFavorite;
      } catch (e) {
        _favoriteStatus[place.id] = false;
      }
    }
  }

  // Метод для переключения избранного
  Future<void> _toggleFavorite(int placeId) async {
    final token = await AuthService.getToken();
    if (token == null) {
      return;
    }

    try {
      final currentStatus = _favoriteStatus[placeId] ?? false;

      if (currentStatus) {
        await ApiService.removeFromFavorites(placeId, token);
      } else {
        await ApiService.addToFavorites(placeId, token);
      }

      if (mounted) {
        setState(() {
          _favoriteStatus[placeId] = !currentStatus;
        });
      }
    } catch (e) {
      // print('Error toggling favorite for place $placeId: $e');
    }
  }

  List<Place> _applyFiltersAndSorting(List<Place> places) {
    // Сначала применяем фильтры
    List<Place> filteredPlaces = _applyFilters(places);

    // Затем применяем сортировку
    return _applySorting(filteredPlaces, sortingValue);
  }

  List<Place> _applyFilters(List<Place> places) {
    List<Place> filtered = places;

    // Применяем поисковый запрос
    if (_searchQuery.trim().isNotEmpty) {
      final query = _searchQuery.trim().toLowerCase();
      filtered =
          filtered.where((place) {
            final nameMatch = place.name.toLowerCase().contains(query);
            final descriptionMatch = place.shortDescription.toLowerCase().contains(query);
            final typeMatch = place.type.toLowerCase().contains(query);
            return nameMatch || descriptionMatch || typeMatch;
          }).toList();
    }

    return filtered;
  }

  List<Place> _applySorting(List<Place> places, String sortType) {
    List<Place> sortedPlaces = List.from(places);

    switch (sortType) {
      case 'Сначала популярные':
        // Сортируем по количеству отзывов (если есть) или по рейтингу
        sortedPlaces.sort((a, b) {
          final aReviews = a.reviews.length;
          final bReviews = b.reviews.length;
          if (aReviews != bReviews) {
            return bReviews.compareTo(aReviews); // По убыванию
          }
          return b.rating.compareTo(a.rating); // По убыванию рейтинга
        });
        break;

      case 'Сначала с высоким рейтингом':
        // Сортируем по рейтингу от высокого к низкому
        sortedPlaces.sort((a, b) => b.rating.compareTo(a.rating));
        break;

      case 'Сначала новые':
        // Сортируем по дате создания от новых к старым
        sortedPlaces.sort((a, b) => b.createdAt.compareTo(a.createdAt));
        break;

      case 'Рандомный порядок':
        // Перемешиваем список случайным образом
        sortedPlaces.shuffle();
        break;

      default:
        // По умолчанию - без сортировки (оригинальный порядок)
        break;
    }

    return sortedPlaces;
  }

  void _onSortingChanged(String newValue) {
    setState(() {
      sortingValue = newValue;
      _filteredPlaces = _applyFiltersAndSorting(_places);
    });
  }

  void _shuffleRandom() {
    setState(() {
      _filteredPlaces = _applySorting(_filteredPlaces, 'Рандомный порядок');
    });
  }

  void _openFilterSheet() {
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
                (context, scrollController) => FilterWidget(
                  categories: mockPlaceCategories,
                  areas: mockAreas,
                  tags: mockPlaceTags,
                  initialFilters: _currentFilters,
                  scrollController: scrollController,
                  onFiltersApplied: (PlaceFilters newFilters) {
                    setState(() {
                      _currentFilters = newFilters;
                      _filteredPlaces = _applyFiltersAndSorting(_places);
                    });
                  },
                ),
          ),
    );
  }

  void _onPlaceTap(Place place) {
    // print('Нажал на место: ${place.name}');
  }

  // Удалить конкретную категорию
  void _removeCategory(int categoryId) {
    setState(() {
      final newCategories = List<int>.from(_currentFilters.selectedCategories);
      newCategories.remove(categoryId);
      _currentFilters = _currentFilters.copyWith(selectedCategories: newCategories);
      _filteredPlaces = _applyFiltersAndSorting(_places);
    });
  }

  // Удалить конкретный район
  void _removeArea(int areaId) {
    setState(() {
      final newAreas = List<int>.from(_currentFilters.selectedAreas);
      newAreas.remove(areaId);
      _currentFilters = _currentFilters.copyWith(selectedAreas: newAreas);
      _filteredPlaces = _applyFiltersAndSorting(_places);
    });
  }

  // Удалить конкретный тег
  void _removeTag(int tagId) {
    setState(() {
      final newTags = List<int>.from(_currentFilters.selectedTags);
      newTags.remove(tagId);
      _currentFilters = _currentFilters.copyWith(selectedTags: newTags);
      _filteredPlaces = _applyFiltersAndSorting(_places);
    });
  }

  // Получить название категории по ID
  String _getCategoryName(int categoryId) {
    final category = mockPlaceCategories.firstWhere(
      (cat) => cat['id'] == categoryId,
      orElse: () => {'name': 'Категория $categoryId'},
    );
    return category['name'];
  }

  // Получить название района по ID
  String _getAreaName(int areaId) {
    final area = mockAreas.firstWhere(
      (a) => a['id'] == areaId,
      orElse: () => {'name': 'Район $areaId'},
    );
    return area['name'];
  }

  // Получить название тега по ID
  String _getTagName(int tagId) {
    final tag = mockPlaceTags.firstWhere(
      (t) => t['id'] == tagId,
      orElse: () => {'name': 'Тег $tagId'},
    );
    return tag['name'];
  }

  // Виджет для чипса категории
  Widget _buildCategoryChip(int categoryId) {
    return AppFilterChip(
      label: _getCategoryName(categoryId),
      onDelete: () => _removeCategory(categoryId),
    );
  }

  // Виджет для чипса района
  Widget _buildAreaChip(int areaId) {
    return AppFilterChip(
      label: _getAreaName(areaId),
      onDelete: () => _removeArea(areaId),
    );
  }

  // Виджет для чипса тега
  Widget _buildTagChip(int tagId) {
    return AppFilterChip(
      label: _getTagName(tagId),
      onDelete: () => _removeTag(tagId),
    );
  }

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      controller: widget.scrollController,
      physics: const ClampingScrollPhysics(), // Убираем эффекты overscroll
      slivers: [
        // ЗАФИКСИРОВАННЫЙ ВЕРХНИЙ БЛОК
        SliverAppBar(
          pinned: true,
          floating: false,
          elevation: 0, // Убираем тень
          surfaceTintColor: Colors.transparent, // Убираем оттенок поверхности
          backgroundColor: AppDesignSystem.whiteColor,
          automaticallyImplyLeading: false,
          expandedHeight: 0,
          toolbarHeight: _calculateFixedBlockHeight(),
          flexibleSpace: Container(
            color: AppDesignSystem.whiteColor,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Индикатор перетаскивания (отступ 8px уже есть в openBottomSheet)
                DragIndicator(
                  color: AppDesignSystem.handleBarColor,
                  padding: EdgeInsets.zero,
                ),
                // Заголовок
                Padding(
                  padding: const EdgeInsets.only(top: 26, bottom: 28),
                  child: Text('Места', style: AppTextStyles.title()),
                ),
                // Поиск и фильтрация
                AppSearchField(
                  controller: _searchController,
                  hint: 'Поиск мест',
                  onChanged: (value) {
                    setState(() {
                      _searchQuery = value;
                      _filteredPlaces = _applyFiltersAndSorting(_places);
                    });
                  },
                  onFilterTap: _openFilterSheet,
                ),
                SizedBox(height: 12),

                // Показываем активные фильтры как отдельные чипсы
                if (_currentFilters.hasActiveFilters)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Wrap(
                        spacing: 8,
                        runSpacing: 4,
                        children: [
                          // Чипсы для категорий
                          ..._currentFilters.selectedCategories.map(_buildCategoryChip),

                          // Чипсы для районов
                          ..._currentFilters.selectedAreas.map(_buildAreaChip),

                          // Чипсы для тегов
                          ..._currentFilters.selectedTags.map(_buildTagChip),
                        ],
                      ),
                  ),

                // Сортировка
                Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      MenuAnchor(
                        style: MenuStyle(
                          padding: WidgetStatePropertyAll(EdgeInsets.all(12)),
                          backgroundColor: WidgetStatePropertyAll(Color.fromARGB(255, 255, 255, 255)),
                          elevation: WidgetStatePropertyAll(0),
                          shadowColor: WidgetStatePropertyAll(Colors.transparent),
                          shape: WidgetStatePropertyAll(
                            RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ), // Кнопка использует встроенный стиль
                        ),
                        builder:
                            (context, controller, child) => IconButton(
                              icon: Row(
                                mainAxisSize: MainAxisSize.min,
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                spacing: 6,
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
              ],
            ),
          ),
        ),

        // ОСТАЛЬНОЙ КОНТЕНТ (прокручивается)
        SliverToBoxAdapter(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (_isLoading)
                Padding(
                  padding: const EdgeInsets.all(14.0),
                  child: CircularProgressIndicator(),
                ),

              if (_hasError)
                Padding(
                  padding: const EdgeInsets.all(14.0),
                  child: Column(
                    children: [
                      Text('Ошибка загрузки мест'),
                      SizedBox(height: 10),
                      ElevatedButton(
                        onPressed: _loadPlaces,
                        child: Text('Попробовать снова'),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),

        if (!_isLoading && !_hasError && _filteredPlaces.isNotEmpty)
          SliverGrid(
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: AppDesignSystem.spacingMedium,
              mainAxisSpacing: AppDesignSystem.spacingMedium,
              childAspectRatio: 187 / 260, // Ширина карточки / высота (260px фиксированная)
            ),
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final place = _filteredPlaces[index];
                  final isFavorite = _favoriteStatus[place.id] ?? false;
                  final totalImages = place.images.length;
                  final currentImageIndex = 0; // Можно добавить логику для переключения изображений

                  return PlaceCard(
                    place: place,
                    isFavorite: isFavorite,
                    currentImageIndex: currentImageIndex,
                    totalImages: totalImages > 0 ? totalImages : 1,
                    onTap: () => _onPlaceTap(place),
                    onFavoriteTap: () => _toggleFavorite(place.id),
                  );
                },
                childCount: _filteredPlaces.length,
              ),
          ),

        if (!_isLoading && !_hasError && _filteredPlaces.isEmpty)
          SliverFillRemaining(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.place, size: 60, color: AppDesignSystem.greyMedium),
                  const SizedBox(height: 16),
                  Text(
                    _currentFilters.hasActiveFilters ? 'Места не найдены по выбранным фильтрам' : 'Места не найдены',
                    style: AppTextStyles.body(
                      color: AppDesignSystem.greyMedium,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: 10),
                  if (_currentFilters.hasActiveFilters)
                    ElevatedButton(
                      onPressed: () {
                        setState(() {
                          _currentFilters = const PlaceFilters();
                          _filteredPlaces = _applyFiltersAndSorting(_places);
                        });
                      },
                      child: Text('Сбросить все фильтры'),
                    )
                  else
                    ElevatedButton(
                      onPressed: _loadPlaces,
                      child: Text('Обновить'),
                    ),
                ],
              ),
            ),
          ),

        // Отступ внизу, чтобы последние элементы были видны полностью
        if (!_isLoading && !_hasError && _filteredPlaces.isNotEmpty)
          const SliverPadding(
            padding: EdgeInsets.only(bottom: 44),
          ),
      ],
    );
  }

  // Метод для расчета высоты фиксированного блока
  double _calculateFixedBlockHeight() {
    double height = 190;

    // Добавляем высоту для активных фильтров если есть
    if (_currentFilters.hasActiveFilters) {
      height += 12 + 96; // отступ + высота чипсов
    }

    return height;
  }
}
