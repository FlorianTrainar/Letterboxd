// utils/starIcon.js

export function starIcon(i, rate) {
  if (rate >= i) {
    return ['fas', 'star'] // pleine
  } else if (rate >= i - 0.5) {
    return ['fas', 'star-half-stroke'] // demi-étoile
  } else {
    return ['far', 'star'] // vide
  }
}
