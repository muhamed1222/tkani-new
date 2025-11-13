import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/app_design_system.dart';
import '../../../models/api_models.dart';
import '../../../utils/smooth_border_radius.dart';
import '../../../core/widgets/widgets.dart';

class RoutesFilterWidget extends StatefulWidget {
  final RouteFilters initialFilters;
  final Function(RouteFilters) onFiltersApplied;
  final ScrollController? scrollController;

  const RoutesFilterWidget({
    super.key,
    required this.initialFilters,
    required this.onFiltersApplied,
    this.scrollController,
  });

  @override
  State<RoutesFilterWidget> createState() => _RoutesFilterWidgetState();
}

class _RoutesFilterWidgetState extends State<RoutesFilterWidget> {
  late RouteFilters _currentFilters;

  @override
  void initState() {
    super.initState();
    _currentFilters = widget.initialFilters;
  }

  void _resetFilters() {
    setState(() {
      _currentFilters = _currentFilters.reset();
    });
  }

  void _applyFilters() {
    widget.onFiltersApplied(_currentFilters);
    Navigator.of(context).pop();
  }

  void _updateSelectedType(String type, bool isSelected) {
    setState(() {
      final newSelectedTypes = List<String>.from(_currentFilters.selectedTypes);
      if (isSelected) {
        newSelectedTypes.add(type);
      } else {
        newSelectedTypes.remove(type);
      }
      _currentFilters = _currentFilters.copyWith(selectedTypes: newSelectedTypes);
    });
  }

  void _updateDistanceRange(double min, double max) {
    setState(() {
      _currentFilters = _currentFilters.copyWith(
        minDistance: min,
        maxDistance: max,
      );
    });
  }

  Widget _buildCheckbox(bool isSelected) {
    return SmoothContainer(
      width: 18,
      height: 18,
      borderRadius: 4,
        color: isSelected ? const Color(0xFF24A79C) : const Color(0xFFF6F6F6),
        border: isSelected
            ? Border.all(color: const Color(0xFF24A79C), width: 2)
            : Border.all(color: const Color(0xFFF6F6F6), width: 2),
      child: isSelected
          ? const Icon(
        Icons.check,
        size: 14,
        color: Colors.white,
      )
          : const SizedBox.shrink(),
    );
  }

  Widget _buildRouteTypeItem(String type) {
    final isSelected = _currentFilters.selectedTypes.contains(type);
    return InkWell(
      onTap: () {
        _updateSelectedType(type, !isSelected);
      },
      child: Container(
        height: 19,
        padding: const EdgeInsets.symmetric(horizontal: 0),
        child: Row(
          children: [
            _buildCheckbox(isSelected),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                type,
                style: GoogleFonts.inter(
                  color: AppDesignSystem.textColorPrimary,
                  
                  fontSize: 16,
                  fontWeight: FontWeight.w400,
                  height: 1.20,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ClipPath(
      clipper: SmoothBorderClipper(radius: 20),
      child: Container(
        color: Colors.white,
      child: Stack(
        children: [
          // Основной контент
          SingleChildScrollView(
            controller: widget.scrollController,
            padding: const EdgeInsets.only(bottom: 120), // Отступ для кнопок
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Индикатор перетаскивания (зафиксирован вверху)
                const DragIndicator(),
                Padding(
                  padding: const EdgeInsets.fromLTRB(14, 18, 14, 0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Заголовок
                      const Center(
                        child: Text(
                          'Фильтры',
                          style: TextStyle(
                            color: AppDesignSystem.textColorPrimary,
                            fontSize: 20,
                            fontWeight: FontWeight.w600,
                            height: 1.20,
                          ),
                        ),
                      ),
                      const SizedBox(height: 28),

                      // Тип маршрута
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 0),
                        child: Text(
                          'Тип маршрута',
                          style: TextStyle(
                            color: AppDesignSystem.textColorPrimary,
                            
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            height: 1.20,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 0),
                        child: Column(
                          children: ['Пеший', 'Авто', 'Комбинированный'].asMap().entries.map((entry) {
                            final index = entry.key;
                            final type = entry.value;
                            return Column(
                              children: [
                                _buildRouteTypeItem(type),
                                if (index < 2) const SizedBox(height: 12),
                              ],
                            );
                          }).toList(),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Протяженность
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 0),
                        child: Text(
                          'Протяженность',
                          style: TextStyle(
                            color: AppDesignSystem.textColorPrimary,
                            
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            height: 1.20,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),

                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 0),
                        child: Column(
                          children: [
                            // Поля "от" и "до" в одной строке
                            Row(
                              children: [
                                // Поле "от"
                                Expanded(
                                  child: SmoothContainer(
                                    height: 39,
                                    padding: const EdgeInsets.symmetric(horizontal: 10),
                                    borderRadius: 8,
                                      color: const Color(0xFFF6F6F6),
                                    child: Row(
                                      children: [
                                        Text(
                                          'от ',
                                          style: TextStyle(
                                            color: const Color(0xFF000000).withOpacity(0.5),
                                            
                                            fontSize: 14,
                                            fontWeight: FontWeight.w400,
                                            height: 1.20,
                                            letterSpacing: -0.28,
                                          ),
                                        ),
                                        Text(
                                          '${_currentFilters.minDistance.toInt()} км',
                                          style: GoogleFonts.inter(
                                            color: AppDesignSystem.textColorPrimary,
                                            
                                            fontSize: 16,
                                            fontWeight: FontWeight.w400,
                                            height: 1.20,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                // Поле "до"
                                Expanded(
                                  child: SmoothContainer(
                                    height: 39,
                                    padding: const EdgeInsets.symmetric(horizontal: 10),
                                    borderRadius: 8,
                                      color: const Color(0xFFF6F6F6),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.end,
                                      children: [
                                        Text(
                                          'до ',
                                          style: TextStyle(
                                            color: const Color(0xFF000000).withOpacity(0.5),
                                            
                                            fontSize: 14,
                                            fontWeight: FontWeight.w400,
                                            height: 1.20,
                                            letterSpacing: -0.28,
                                          ),
                                        ),
                                        Text(
                                          '${_currentFilters.maxDistance.toInt()} км',
                                          style: GoogleFonts.inter(
                                            color: AppDesignSystem.textColorPrimary,
                                            
                                            fontSize: 16,
                                            fontWeight: FontWeight.w400,
                                            height: 1.20,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),

                            // Слайдеры для выбора диапазона
                            SizedBox(
                              height: 40,
                              child: Stack(
                                alignment: Alignment.center,
                                children: [
                                  // Фоновая линия
                                  SmoothContainer(
                                    height: 3,
                                    width: double.infinity,
                                    margin: const EdgeInsets.symmetric(horizontal: 4),
                                    borderRadius: 2,
                                      color: const Color(0xFFF6F6F6),
                                    child: const SizedBox.shrink(),
                                  ),

                                  // Слайдер для минимального значения
                                  SliderTheme(
                                    data: SliderTheme.of(context).copyWith(
                                      trackHeight: 0,
                                      thumbColor: const Color(0xFF24A79C),
                                      activeTrackColor: Colors.transparent,
                                      inactiveTrackColor: Colors.transparent,

                                      thumbShape: const RoundSliderThumbShape(
                                        enabledThumbRadius: 10,
                                        disabledThumbRadius: 10,
                                      ),
                                      overlayShape: const RoundSliderOverlayShape(
                                        overlayRadius: 16,
                                      ),
                                    ),
                                    child: Slider(
                                      value: _currentFilters.minDistance,
                                      min: 1,
                                      max: 30,
                                      onChanged: (value) {
                                        if (value <= _currentFilters.maxDistance) {
                                          _updateDistanceRange(value, _currentFilters.maxDistance);
                                        } else {
                                          _updateDistanceRange(_currentFilters.maxDistance, _currentFilters.maxDistance);
                                        }
                                      },
                                    ),
                                  ),

                                  // Слайдер для максимального значения
                                  SliderTheme(
                                    data: SliderTheme.of(context).copyWith(
                                      trackHeight: 0,
                                      thumbColor: const Color(0xFF24A79C),
                                      activeTrackColor: Colors.transparent,
                                      inactiveTrackColor: Colors.transparent,
                                      thumbShape: const RoundSliderThumbShape(
                                        enabledThumbRadius: 10,
                                        disabledThumbRadius: 10,
                                      ),
                                      overlayShape: const RoundSliderOverlayShape(
                                        overlayRadius: 16,
                                      ),
                                    ),
                                    child: Slider(
                                      value: _currentFilters.maxDistance,
                                      min: 1,
                                      max: 30,
                                      onChanged: (value) {
                                        if (value >= _currentFilters.minDistance) {
                                          _updateDistanceRange(_currentFilters.minDistance, value);
                                        } else {
                                          _updateDistanceRange(_currentFilters.minDistance, _currentFilters.minDistance);
                                        }
                                      },
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20), // Нижний отступ для контента
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Контейнер с кнопками (зафиксирован внизу)
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: ClipPath(
              clipper: SmoothBorderClipper(radius: 20),
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFC0C0C0).withOpacity(0.10),
                    offset: const Offset(0, -2),
                    blurRadius: 20,
                    spreadRadius: 0,
                  ),
                ],
              ),
              child: BottomActionBar(
                onCancel: _resetFilters,
                onConfirm: _applyFilters,
                cancelText: 'Сбросить',
                confirmText: 'Применить',
              ),
            ),
            ),
          ),
        ],
        ),
      ),
    );
  }
}