// Iconify performance improvement
Iconify.preloadImages([
  'ant-design:home',
  'ant-design:home-outline',
  'fa-solid:search',
  'ion:ios-search',
  'entypo:squared-plus',
  'fa-regular:plus-square',
  'zmdi:notifications',
  'zmdi:notifications-none',
  'fa-solid:user',
  'fa-regular:user',
]);
Iconify.setConfig('localStorage', true);

const children = $('.event-outer-columns').children();

const DESKTOP_WIDTH = 1088;
const TABLET_WIDTH = 768;

$(window).on('load resize', function() {
  if ($(this).width() > TABLET_WIDTH) {
    $('.event-outer-columns').removeClass('is-gapless');
    children.addClass('is-6');

  } else {
    $('.event-outer-columns').addClass('is-gapless');
    children.removeClass('is-6');
  }
});
