export let mapImage = null, circleImageTop = null, circleImageBottom = null, logoImage = null, backgroundImage = null, detailImage = null;
export let watermarkImage = new Image();
watermarkImage.src = './assets/images/cr.png';
export let imageX = 0, imageY = 0, imageScale = 1;
export let circleImageXTop = 0, circleImageYTop = 0, circleImageScaleTop = 1;
export let circleImageXBottom = 0, circleImageYBottom = 0, circleImageScaleBottom = 1;
export let detailImageX = 0, detailImageY = 0, detailImageScale = 1;
export let isDragging = false, isDraggingTop = false, isDraggingBottom = false, isDraggingDetail = false;
export let startX, startY;

export let currentLangData = {};
export let selectedRegion = 'hispano';

export function setMapImage(img) { mapImage = img; }
export function setCircleImageTop(img) { circleImageTop = img; }
export function setCircleImageBottom(img) { circleImageBottom = img; }
export function setLogoImage(img) { logoImage = img; }
export function setBackgroundImage(img) { backgroundImage = img; }
export function setDetailImage(img) { detailImage = img; }

export function setImageX(x) { imageX = x; }
export function setImageY(y) { imageY = y; }
export function setImageScale(s) { imageScale = s; }

export function setCircleImageXTop(x) { circleImageXTop = x; }
export function setCircleImageYTop(y) { circleImageYTop = y; }
export function setCircleImageScaleTop(s) { circleImageScaleTop = s; }

export function setCircleImageXBottom(x) { circleImageXBottom = x; }
export function setCircleImageYBottom(y) { circleImageYBottom = y; }
export function setCircleImageScaleBottom(s) { circleImageScaleBottom = s; }

export function setDetailImageX(x) { detailImageX = x; }
export function setDetailImageY(y) { detailImageY = y; }
export function setDetailImageScale(s) { detailImageScale = s; }

export function setIsDragging(val) { isDragging = val; }
export function setIsDraggingTop(val) { isDraggingTop = val; }
export function setIsDraggingBottom(val) { isDraggingBottom = val; }
export function setIsDraggingDetail(val) { isDraggingDetail = val; }

export function setStartX(val) { startX = val; }
export function setStartY(val) { startY = val; }

export function setCurrentLangData(data) { currentLangData = data; }
export function setSelectedRegion(region) { selectedRegion = region; }
