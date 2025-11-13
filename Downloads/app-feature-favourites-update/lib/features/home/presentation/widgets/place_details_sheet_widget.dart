import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:tropanartov/features/home/domain/entities/place.dart';
import 'package:tropanartov/features/home/presentation/bloc/home_bloc.dart';
import 'package:tropanartov/features/home/presentation/widgets/rating_dialog.dart';
import 'package:tropanartov/services/api_service.dart';
import 'package:tropanartov/services/auth_service.dart';
import 'package:tropanartov/models/api_models.dart' hide Image, Place;
import 'dart:ui' as ui;
import '../../../../utils/smooth_border_radius.dart';
import '../../../../core/constants/app_design_system.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/widgets/widgets.dart';

/// Всплывающее окно с деталями места
/// Показывается снизу экрана и растягивается от 50% до 100%
class PlaceDetailsSheet extends StatefulWidget {
  final Place place;

  const PlaceDetailsSheet({
    super.key,
    required this.place,
  });

  @override
  State<PlaceDetailsSheet> createState() => _PlaceDetailsSheetState();
}

class _PlaceDetailsSheetState extends State<PlaceDetailsSheet> {
  double _sheetExtent = 0.5; // Текущий размер sheet (от 0.0 до 1.0)
  static const double _closeThreshold = 0.12; // Порог для закрытия окна
  final DraggableScrollableController _sheetController = DraggableScrollableController(); // Контроллер для программного управления sheet
  bool _isInitialAnimation = true; // true = идёт анимация появления
  int _selectedTabIndex = 0; // 0 = История, 1 = Обзор, 2 = Отзывы
  bool _isBookmarked = false; // Состояние закладки

  // Добавляем состояние для отзывов
  List<Review> _reviews = [];
  bool _isLoadingReviews = false;
  String? _reviewsError;
  bool _reviewsLoaded = false; // Флаг, что отзывы уже загружались

  @override
  void initState() {
    super.initState();

    // Плавное появление окна при открытии
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted && _sheetController.isAttached) {
        _sheetController
            .animateTo(
          0.5,
          duration: const Duration(milliseconds: 400),
          curve: Curves.easeOutCubic,
        )
            .then((_) {
          if (mounted) {
            setState(() {
              _isInitialAnimation = false;
            });
          }
        });
      }
    });

    _checkFavoriteStatus(); // Проверяем статус при инициализации
  }

  // Метод для проверки статуса избранного
  Future<void> _checkFavoriteStatus() async {
    final token = await AuthService.getToken();
    if (token != null) {
      try {
        final isFavorite = await ApiService.isPlaceFavorite(widget.place.id, token);
        if (mounted) {
          setState(() {
            _isBookmarked = isFavorite;
          });
        }
      } catch (e) {
        // print('Error checking favorite status: $e');
      }
    }
  }

  // Метод для переключения избранного
  Future<void> _toggleFavorite() async {
    final token = await AuthService.getToken();
    if (token == null) {

      return;
    }

    try {
      if (_isBookmarked) {
        await ApiService.removeFromFavorites(widget.place.id, token);
        if (mounted) {
          setState(() {
            _isBookmarked = false;
          });
        }
      } else {
        await ApiService.addToFavorites(widget.place.id, token);
        if (mounted) {
          setState(() {
            _isBookmarked = true;
          });
        }
      }
    } catch (e) {
      // print('Error toggling favorite: $e');
    }
  }

  // Метод для загрузки отзывов
  Future<void> _loadReviews() async {
    if (_isLoadingReviews || _reviewsLoaded) return;

    if (mounted) {
      setState(() {
        _isLoadingReviews = true;
        _reviewsError = null;
      });
    }

    try {
      final reviews = await ApiService.getReviewsForPlace(widget.place.id);

      if (mounted) {
        setState(() {
          _reviews = reviews;
          _reviewsLoaded = true;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _reviewsError = e.toString();
        });
      }
      // print('Error loading reviews: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoadingReviews = false;
        });
      }
    }
  }

  Future<void> _refreshReviews() async {
    if (mounted) {
      setState(() {
        _isLoadingReviews = true;
        _reviewsError = null;
      });
    }

    try {
      final reviews = await ApiService.getReviewsForPlace(widget.place.id);
      if (mounted) {
        setState(() {
          _reviews = reviews;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _reviewsError = e.toString();
        });
      }
      // print('Error refreshing reviews: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoadingReviews = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _sheetController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      controller: _sheetController,
      initialChildSize: 0.0,
      minChildSize: 0.0,
      maxChildSize: 1.0,
      snap: true,
      snapSizes: const [0.5, 1.0],
      builder: (context, scrollController) {
        final h = MediaQuery.of(context).size.height;
        final double minImg = h * 0.15;
        final double maxImg = h * 0.35;

        final double t = ((_sheetExtent - 0.5) / (1.0 - 0.5)).clamp(0.0, 1.0);

        final double imageHeight = ui.lerpDouble(minImg, maxImg, t)!;

        return NotificationListener<DraggableScrollableNotification>(
          onNotification: (notification) {
            setState(() => _sheetExtent = notification.extent);

            if (notification.extent < _closeThreshold && notification.extent > 0.0 && !_isInitialAnimation) {
              _sheetController.animateTo(
                0.0,
                duration: const Duration(milliseconds: 200),
                curve: Curves.easeOut,
              );
              Future.delayed(const Duration(milliseconds: 250), () {
                if (mounted) {
                  context.read<HomeBloc>().add(const ClosePlaceDetails());
                }
              });
            }
            return false;
          },
          child: ClipPath(
            clipper: SmoothBorderClipper(radius: AppDesignSystem.borderRadiusLarge),
          child: Container(
              color: AppDesignSystem.backgroundColor,
            child: Stack(
              children: [
                CustomScrollView(
                  controller: scrollController,
                  slivers: [
                    SliverToBoxAdapter(
                      child: SizedBox(
                        height: imageHeight,
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            ClipPath(
                              clipper: SmoothBorderClipper(radius: AppDesignSystem.borderRadiusLarge),
                              child: Image.network(
                                widget.place.images.first.url,
                                fit: BoxFit.cover,
                                errorBuilder:
                                    (context, error, stackTrace) => Container(
                                  color: AppDesignSystem.greyLight,
                                  child: Icon(Icons.image_not_supported, size: 50, color: AppDesignSystem.textColorPrimary),
                                ),
                              ),
                            ),
                            SmoothContainer(
                              borderRadius: AppDesignSystem.borderRadiusLarge,
                              decoration: const BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                  colors: [Colors.transparent, Color(0x8A000000)],
                                ),
                              ),
                              child: const SizedBox.shrink(),
                            ),
                            // Кнопка bookmark в правом верхнем углу
                            Positioned(
                              top: AppDesignSystem.spacingLarge,
                              right: AppDesignSystem.spacingLarge,
                              child: GestureDetector(
                                onTap: _toggleFavorite,
                                child: SmoothContainer(
                                  width: 35,
                                  height: 35,
                                  borderRadius: AppDesignSystem.borderRadiusInput,
                                    color: const Color(0x4DFFFFFF),
                                  child: Icon(
                                    _isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                                    size: AppDesignSystem.iconSizeSmall,
                                    color: AppDesignSystem.textColorWhite,
                                  ),
                                ),
                              ),
                            ),
                            Positioned(
                              left: 0,
                              right: 0,
                              bottom: -AppDesignSystem.spacingLarge,
                              child: ClipPath(
                                clipper: SmoothBorderClipper(radius: AppDesignSystem.borderRadiusLarge),
                              child: Container(
                                height: 32,
                                  color: AppDesignSystem.backgroundColor,
                                ),
                              ),
                            ),
                            Positioned(
                              bottom: 2,
                              left: 0,
                              right: 0,
                              child: DragIndicator(
                                color: AppDesignSystem.greyColor,
                                borderRadius: AppDesignSystem.borderRadiusTiny,
                                padding: EdgeInsets.zero,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    SliverToBoxAdapter(
                      child: Container(
                        color: AppDesignSystem.backgroundColor,
                        padding: const EdgeInsets.all(AppDesignSystem.paddingHorizontal),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Название и рейтинг
                            PlaceNameAndRatingWidget(widget: widget),
                            SizedBox(height: AppDesignSystem.spacingSmall + 1),
                            PlaceTypeWidget(widget: widget),
                            SizedBox(height: AppDesignSystem.spacingXLarge),
                            _buildTabs(),
                            SizedBox(height: AppDesignSystem.spacingLarge),
                          ],
                        ),
                      ),
                    ),
                    SliverToBoxAdapter(
                      child: Container(
                        color: AppDesignSystem.backgroundColor,
                        padding: const EdgeInsets.symmetric(horizontal: AppDesignSystem.paddingHorizontal),
                        child: _buildTabContent(),
                      ),
                    ),
                    // Добавляем отступ для кнопок
                    SliverToBoxAdapter(
                      child: SizedBox(height: AppDesignSystem.buttonHeight + AppDesignSystem.paddingHorizontal * 2),
                    ),
                  ],
                ),
                // Фиксированные кнопки внизу
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 0,
                  child: Container(
                    padding: const EdgeInsets.all(AppDesignSystem.paddingHorizontal),
                    decoration: BoxDecoration(
                      color: AppDesignSystem.backgroundColor,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        // Кнопка "Оценить" с диалогом
                        RatingDialog(
                          place: widget.place,
                          onReviewAdded: _refreshReviews, // Обновляем отзывы после добавления
                        ),
                        SizedBox(width: AppDesignSystem.spacingSmall + 2),
                        Expanded(
                          child: BlocBuilder<HomeBloc, HomeState>(
                            builder: (context, state) {
                              final isRouteBuilding = state.isLoading && state.routePoints.length == 1;
                              final currentPlaceInRoute = state.routePoints.any((p) => p.id == widget.place.id);
                              // Кнопка всегда активна, кроме случая когда строится маршрут
                              final canAddToRoute = !isRouteBuilding;

                              return InkWell(
                                onTap: canAddToRoute ? () {
                                  // Маршрут всегда будет от моего местоположения до выбранного места
                                  context.read<HomeBloc>().add(AddRoutePoint(widget.place));

                                  // Закрываем PlaceDetailsSheet после добавления в маршрут
                                  _sheetController.animateTo(
                                    0.0,
                                    duration: const Duration(milliseconds: 200),
                                    curve: Curves.easeOut,
                                  );
                                  Future.delayed(const Duration(milliseconds: 250), () {
                                    if (mounted) {
                                      context.read<HomeBloc>().add(const ClosePlaceDetails());
                                    }
                                  });
                                } : null,
                                child: SmoothContainer(
                                  padding: const EdgeInsets.symmetric(horizontal: 91, vertical: AppDesignSystem.paddingVerticalLarge),
                                  borderRadius: AppDesignSystem.borderRadius,
                                    color: canAddToRoute ? AppDesignSystem.primaryColor : AppDesignSystem.greyColor,
                                    border: Border.all(color: canAddToRoute ? AppDesignSystem.primaryColor : AppDesignSystem.greyColor),
                                  child: isRouteBuilding
                                      ? Center(
                                    child: SizedBox(
                                      height: AppDesignSystem.loadingIndicatorSize,
                                      width: AppDesignSystem.loadingIndicatorSize,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        valueColor: const AlwaysStoppedAnimation<Color>(AppDesignSystem.textColorWhite),
                                      ),
                                    ),
                                  )
                                      : Text(
                                    currentPlaceInRoute ? 'Маршрут' : 'Маршрут',
                                    style: AppTextStyles.button(),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            ),
          ),
        );
      },
    );
  }
  Widget _buildInfoRow(String iconAsset, String title, List<String> contents) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppDesignSystem.paddingVerticalMedium),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SvgPicture.asset(
            iconAsset,
            width: AppDesignSystem.spacingLarge,
            height: AppDesignSystem.spacingLarge,
          ),
          SizedBox(width: AppDesignSystem.spacingTiny + 2),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTextStyles.body(
                    fontWeight: AppDesignSystem.fontWeightMedium,
                  ),
                ),
                SizedBox(height: AppDesignSystem.spacingTiny),
                ...contents.map((content) => Padding(
                  padding: const EdgeInsets.only(bottom: 2.0),
                  child: Text(
                    content,
                    style: AppTextStyles.body(
                      color: AppDesignSystem.textColorSecondary,
                    ),
                  ),
                )),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabs() {
    return SmoothContainer(
      width: double.infinity,
      padding: const EdgeInsets.all(AppDesignSystem.spacingTiny),
      borderRadius: AppDesignSystem.borderRadius,
        color: AppDesignSystem.backgroundColorSecondary,
      child: Row(
        children: [
          _buildTab('История', 0),
          _buildTab('Обзор', 1),
          _buildTab('Отзывы', 2),
        ],
      ),
    );
  }

  Widget _buildTab(String title, int index) {
    final bool isSelected = _selectedTabIndex == index;
    return Expanded(
      child: InkWell(
        onTap: () {
          setState(() {
            _selectedTabIndex = index;
          });
          // Загружаем отзывы при переключении на вкладку
          if (index == 2 && !_reviewsLoaded && !_isLoadingReviews) {
            _loadReviews();
          }
        },
        child: SmoothContainer(
          padding: const EdgeInsets.all(AppDesignSystem.spacingSmall + 2),
          borderRadius: AppDesignSystem.spacingSmall + 2,
            color: isSelected ? AppDesignSystem.primaryColor : Colors.transparent,
          child: Center(
            child: Text(
              title,
              style: AppTextStyles.small(
                color: isSelected ? AppDesignSystem.textColorWhite : AppDesignSystem.textColorPrimary,
                fontWeight: isSelected ? AppDesignSystem.fontWeightMedium : AppDesignSystem.fontWeightRegular,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTabContent() {
    switch (_selectedTabIndex) {
      case 0:
        return _buildHistoryContent();
      case 1:
        return _buildOverviewContent();
      case 2:
        return _buildReviewsContent();
      default:
        return _buildOverviewContent();
    }
  }

  Widget _buildOverviewContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildInfoRow('assets/location.svg', 'Адрес', [widget.place.address]),
        _buildInfoRow('assets/clock.svg', 'Часы работы', [
          widget.place.hours,
          if (widget.place.weekend != null && widget.place.weekend!.isNotEmpty) widget.place.weekend!,
          if (widget.place.entry != null && widget.place.entry!.isNotEmpty) widget.place.entry!,
        ]),
        _buildInfoRow('assets/phone.svg', 'Телефон', [widget.place.contacts]),
        if (widget.place.contactsEmail != null && widget.place.contactsEmail!.isNotEmpty)
          Padding(
            padding: EdgeInsets.only(left: AppDesignSystem.spacingLarge + AppDesignSystem.spacingLarge + AppDesignSystem.spacingTiny + 2),
            child: Text(
              widget.place.contactsEmail!,
              style: AppTextStyles.body(
                color: AppDesignSystem.textColorSecondary,
              ),
            ),
          ),
        SizedBox(height: AppDesignSystem.spacingLarge),
      ],
    );
  }
  Widget _buildHistoryContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(height: AppDesignSystem.spacingLarge),
        Text(
          widget.place.history.isNotEmpty
              ? widget.place.history
              : 'Историческая информация отсутствует',
          style: AppTextStyles.body(),
        ),
      ],
    );
  }

  Widget _buildReviewsContent() {
    // Если отзывы еще не загружались и не загружены, начинаем загрузку
    if (!_reviewsLoaded && !_isLoadingReviews) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _loadReviews();
      });
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Отзывы',
              style: AppTextStyles.bodyLarge(
                fontWeight: AppDesignSystem.fontWeightBold,
              ),
            ),
          ],
        ),
        SizedBox(height: AppDesignSystem.spacingLarge),

        if (_isLoadingReviews)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(AppDesignSystem.paddingVerticalMedium),
              child: Column(
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: AppDesignSystem.spacingSmall),
                  Text(
                    'Загрузка отзывов...',
                    style: AppTextStyles.secondary(
                      color: AppDesignSystem.greyColor,
                    ),
                  ),
                ],
              ),
            ),
          )
        else if (_reviewsError != null)
          Column(
            children: [
              SmoothContainer(
                padding: const EdgeInsets.all(AppDesignSystem.paddingVerticalMedium),
                borderRadius: AppDesignSystem.borderRadius,
                  color: AppDesignSystem.errorColor.withValues(alpha: 0.1),
                child: Column(
                  children: [
                    Text(
                      'Ошибка загрузки отзывов',
                      style: AppTextStyles.error(
                        fontWeight: AppDesignSystem.fontWeightBold,
                      ),
                    ),
                    SizedBox(height: AppDesignSystem.spacingSmall),
                    Text(
                      _reviewsError!,
                      style: AppTextStyles.error(),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: AppDesignSystem.spacingSmall),
                    PrimaryButton(
                      text: 'Попробовать снова',
                      onPressed: _refreshReviews,
                    ),
                  ],
                ),
              ),
            ],
          )
        else if (_reviews.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(AppDesignSystem.paddingVerticalMedium),
                child: Column(
                  children: [
                    Icon(Icons.reviews_outlined, size: 64, color: AppDesignSystem.greyColor),
                    SizedBox(height: AppDesignSystem.spacingLarge),
                    Text(
                      'Пока нет отзывов',
                      style: AppTextStyles.body(
                        color: AppDesignSystem.greyColor,
                      ),
                    ),
                    SizedBox(height: AppDesignSystem.spacingSmall),
                    Text(
                      'Будьте первым, кто оставит отзыв!',
                      style: AppTextStyles.small(
                        color: AppDesignSystem.greyColor,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            )
          else
            ..._reviews.map((review) => _buildReviewItem(
              review.authorName,
              review.rating.toDouble(),
              review.text,
              review.formattedDate,
            )),
      ],
    );
  }

  Widget _buildReviewItem(String name, double rating, String comment, String date) {
    return SmoothContainer(
      margin: const EdgeInsets.only(bottom: AppDesignSystem.paddingVerticalMedium),
      padding: const EdgeInsets.all(AppDesignSystem.paddingVerticalMedium),
      borderRadius: AppDesignSystem.borderRadius,
        color: const Color(0xFFF8F8F8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                name,
                style: AppTextStyles.body(
                  fontWeight: AppDesignSystem.fontWeightSemiBold,
                ),
              ),
              Row(
                children: [
                  Icon(Icons.star, color: Colors.amber, size: AppDesignSystem.spacingLarge),
                  SizedBox(width: AppDesignSystem.spacingTiny),
                  Text(
                    _formatRating(rating),
                    style: AppTextStyles.small(
                      fontWeight: AppDesignSystem.fontWeightSemiBold,
                    ),
                  ),
                ],
              ),
            ],
          ),
          SizedBox(height: AppDesignSystem.spacingSmall),
          Text(
            comment,
            style: AppTextStyles.small(),
          ),
          SizedBox(height: AppDesignSystem.spacingSmall),
          Text(
            date,
            style: AppTextStyles.error(
              color: AppDesignSystem.greyMedium,
            ),
          ),
        ],
      ),
    );
  }

  String _formatRating(double rating) {
    return rating.toStringAsFixed(1);
  }
}

class PlaceTypeWidget extends StatelessWidget {
  const PlaceTypeWidget({
    super.key,
    required this.widget,
  });

  final PlaceDetailsSheet widget;

  @override
  Widget build(BuildContext context) {
    return SmoothContainer(
      padding: const EdgeInsets.symmetric(horizontal: AppDesignSystem.spacingMedium, vertical: AppDesignSystem.spacingTiny + 2),
      borderRadius: AppDesignSystem.borderRadiusLarge,
        color: AppDesignSystem.primaryColor.withValues(alpha: 0.12),
      child: Text(
        widget.place.type,
        style: AppTextStyles.small(
          color: AppDesignSystem.primaryColor,
        ),
      ),
    );
  }
}

class PlaceNameAndRatingWidget extends StatelessWidget {
  const PlaceNameAndRatingWidget({
    super.key,
    required this.widget,
  });

  final PlaceDetailsSheet widget;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Text(
            widget.place.name,
            style: AppTextStyles.title(),
          ),
        ),
        SizedBox(width: AppDesignSystem.spacingXLarge),
        SmoothContainer(
          padding: const EdgeInsets.symmetric(horizontal: AppDesignSystem.spacingSmall, vertical: AppDesignSystem.spacingTiny),
          borderRadius: AppDesignSystem.borderRadiusSmall,
            color: AppDesignSystem.backgroundColorSecondary,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.star, color: Colors.amber, size: AppDesignSystem.spacingLarge),
              SizedBox(width: AppDesignSystem.spacingTiny),
              Text(
                widget.place.rating.toStringAsFixed(1),
                style: AppTextStyles.body(),
              ),
            ],
          ),
        ),
      ],
    );
  }
}