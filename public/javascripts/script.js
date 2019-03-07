$(document).ready(function() {

  // Check for click events on the navbar burger icon
  $('.navbar-burger').click(() => {
    // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
    $('.navbar-burger').toggleClass('is-active');
    $('.navbar-menu').toggleClass('is-active');
  }); 2

  const children = $('.event-outer-columns').children();
  console.log(children)

  $(window).on('resize', function() {
    if ($(this).width() > 768) {
      $('.event-outer-columns').removeClass('is-gapless')
      children.addClass('is-6');
      
    } else {
      $('.event-outer-columns').addClass('is-gapless')
      children.removeClass('is-6');
    }
  });
});