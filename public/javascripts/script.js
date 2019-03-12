'use strict';
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

const FULLHD_WIDTH = 1408;
const WIDESCREEN_WIDTH = 1216;
const DESKTOP_WIDTH = 1024;
const TABLET_WIDTH = 768;

// JavaScript-based media queries-like
$(window).on('load resize', () => {
  const windowWidth = $(this).innerWidth();

  changeEventsColumnsCSS(windowWidth);
  changeUserProfileCSS(windowWidth);
});

/**
 * Change the CSS class of events columns based on viewport width
 *
 * @param {number} windowWidth The current window inner width
 */
function changeEventsColumnsCSS(windowWidth) {
  const children = $('.event-columns').children();

  if (windowWidth >= DESKTOP_WIDTH) {
    if (!children.hasClass('column is-3')) {
      children.removeClass().addClass('column is-3');
    }
  } else if (windowWidth >= TABLET_WIDTH) {
    if (!children.hasClass('column is-4')) {
      children.removeClass().addClass('column is-4');
    }
  } else {
    if (children.hasClass('column is-3') || children.hasClass('column is-4')) {
      children.removeClass().addClass('column');
    }
  }
}

/**
 * Change the CSS class of user profile page based on viewport width
 *
 * @param {number} windowWidth The current window inner width
 */
function changeUserProfileCSS(windowWidth) {
  // The width just enough for user stats to fit above follow button
  const STATS_WIDTH = 640;
  const userStats = $('#user-stats');
  const children = userStats.children();
  const userStories = $('#user-stories');
  const userFollowers = $('#user-followers');
  const userFollowing = $('#user-following');

  if (windowWidth >= STATS_WIDTH) {

    if (!userStats.hasClass('level is-mobile')) {
      userStats.removeClass().addClass('level is-mobile');
      userStats.insertAfter('#user-name');

      if (!children.hasClass('level-item is-block')) {
        children.removeClass().addClass('level-item is-block');

        if (!userStories.hasClass('subtitle')) {
          userStories.removeClass('title').addClass('subtitle');
          userStories.siblings().remove();
          userStories.html(`<strong>${userStories.text()}</strong> stories`);
        }

        if (!userFollowers.hasClass('subtitle')) {
          userFollowers.removeClass('title').addClass('subtitle');
          userFollowers.siblings().remove();
          userFollowers.html(`<strong>${userFollowers.text()}</strong> followers`);
        }

        if (!userFollowing.hasClass('subtitle')) {
          userFollowing.removeClass('title').addClass('subtitle');
          userFollowing.siblings().remove();
          userFollowing.html(`<strong>${userFollowing.text()}</strong> following`);
        }
      }
    }
  } else {
    if (!userStats.hasClass('card-footer')) {
      userStats.removeClass().addClass('card-footer');
      userStats.insertAfter('#user-description');

      if (!children.hasClass('card-footer-item has-text-centered')) {
        children.removeClass().addClass('card-footer-item has-text-centered');

        if (!userStories.hasClass('title')) {
          userStories.removeClass('subtitle').addClass('title');
          $('<p class="subtitle is-6">stories</p>').insertAfter(userStories);
          userStories.html(userStories.children('strong').text());
        }

        if (!userFollowers.hasClass('title')) {
          userFollowers.removeClass('subtitle').addClass('title');
          $('<p class="subtitle is-6">followers</p>').insertAfter(userFollowers);
          userFollowers.html(userFollowers.children('strong').text());
        }

        if (!userFollowing.hasClass('title')) {
          userFollowing.removeClass('subtitle').addClass('title');
          $('<p class="subtitle is-6">following</p>').insertAfter(userFollowing);
          userFollowing.html(userFollowing.children('strong').text());
        }
      }
    }
  }
}
