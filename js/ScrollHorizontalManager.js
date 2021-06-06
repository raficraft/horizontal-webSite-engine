class ScrollHorizontalManager{

	/** 
	* @param {HTMLElement} element
	* @param {object}  params
	* @param {object}  [slideName] Container du slide
	* @param {number}  [slideSize] Largeur du slide par apport à la flargeur de la fenêtre
	* @param {number}  [slideTransition] Durée de la transition
	* @param {boolean} [slideLink] Navigation lié à ce slide
	* @param {boolean} [jumpLink] Désactive l'animation du slide lors du click sur les liens de l'animation
	* @param {HTMLElement} [pushUp] Recalcule la hauteur du slide en fonction du 
	*/

		constructor(params = {}){	

			this.params = Object.assign({},{		

				slideXWithMouseWheel : false,
				sliderName : 'hs',
				currentSlide : 0,

				infiniteLoop : true,

				slideWidth : 95,
				slideTransition : '0.3',
				slideLink : true,
				jumpLink : false,			

				pushUp : false,
				puhsDown : false,

				linkClassName :  'linkSlideHorizontal'

			},params)


			//get children el [].slice.call(element.children)

			this.slideWrapper = document.querySelector(`[data-${this.params.sliderName}]`)
			this.scrollContainer = document.querySelector(`[data-${this.params.sliderName}Container]`)			

			console.log([].slice.call(this.slideWrapper.children));

			this.slideCollection = [].slice.call(this.scrollContainer.children)
			this.nbSlide = this.slideCollection.length

			this.offset = 0

			if(this.params.slideLink === true){
				this.linkContainer = document.querySelector(`[data-${this.params.sliderName}nav]`)
				console.log(this.linkContainer);
				console.log();
				this.linkCollection = document.querySelectorAll(`[data-${this.params.sliderName}Link]`)
				this.slideLink()
				this.linkCollection[0].classList.add(`active`) 
			}


			if(document.querySelector(`[data-${this.params.sliderName}prev]`) && document.querySelector(`[data-${this.params.sliderName}next]`)){

				this.buttonPrev = document.querySelector(`[data-${this.params.sliderName}prev]`)
				this.buttonNext = document.querySelector(`[data-${this.params.sliderName}next]`)

				this.buttonPrev.addEventListener('click' , e => {

					this.goToPrev()
				})
				this.buttonNext.addEventListener('click' , e => {

					this.goToNext()
				})


			}

			this.slideView = 1

			this.drawSliderPage()
			this.resizeSlider()
			this.keyBoardControl()
			if(this.params.slideXWithMouseWheel === true){
			this.slider()
			}
			this.manageDrag()

		}

 //ENGINE

	drawSliderPage(){

		//presence of a header
		//presence of a footer

		const {linkCollection } = this	

		this.slideView = parseInt(Math.round(100 / this.params.slideWidth))

		//get number of slide view to add

		if(this.params.infiniteLoop === true){
			this.infiniteLoop()
		}	

		//Define width of parent container of slide
		this.widthContainer = `${(this.nbSlide * this.params.slideWidth)}vw `		
		this.scrollContainer.style.width = this.widthContainer 
		this.scrollContainer.style.transitionDuration = `0s`

		//Define width && id of Slide && inject this to the parent container

		for (const key in this.slideCollection) {
			if (Object.hasOwnProperty.call(this.slideCollection, key)) {

				const slideItem = this.slideCollection[key];
				slideItem.style.minWidth = `${this.params.slideWidth}vw`
				slideItem.setAttribute('id',`${this.params.sliderName}_${key}`)	
				
				//Resize lastSlide if infiniteLoop = false
				if(parseInt(key) === parseInt(this.nbSlide) - 1 && this.params.infiniteLoop === false && this.params.slideWidth < 100){
					slideItem.style.minWidth = `100vw`
				}
				
			}
		}

		//Associate anchor link with slide ID
		if(this.params.slideLink === true){
			for (const key in this.linkCollection) {
				if (Object.hasOwnProperty.call(this.linkCollection, key)) {
					const link = this.linkCollection[key];

					link.setAttribute('href',`${this.params.sliderName}_${parseInt(key) + this.offset}`)					
					
				}
			}
		}

		//defines the bounds of the visible slider and the constructed slider
		this.idxStart = 0 //Start of the constructed slider
		this.idxEnd = this.nbSlide - 1 //End of the constructed slider
		this.idxLimitStart = this.offset //Start of slider visible
		this.idxLimitEnd = this.idxEnd - this.offset //End of slider visible		

		this.goToSlide(this.params.currentSlide)
		setTimeout(()=>{
			this.enabledTransition()
		},0)

	}

	infiniteLoop(){

		//Remove old original HTML contenant
		for (const item of this.slideCollection) {	
			item.remove()			
		}

		const addSlide = parseInt(Math.round(100 / this.params.slideWidth))
		
		this.offset = Math.round(addSlide * 2)		
		if(addSlide >= this.nbSlide - 1){
			alert(
				`Vous essayez d'afficher plus ou autant de slide qu'il y en à dans la vue. La tolérance étant le nombre de slide - 1. Merci de rectifier le paramètres slideWidth à une dimension supérieur`
			)
		}

		//DrawSlider

		let slideCollection = [...this.slideCollection];
		
		this.slideCollection = [
			...slideCollection.slice(this.nbSlide - this.offset).map(item => item.cloneNode(true)),
			...slideCollection,
			...slideCollection.slice(0, this.offset).map(item => item.cloneNode(true))
		]


		console.log(this.slideCollection);

		//redefinition of the number of slides
		this.nbSlide = this.slideCollection.length		

		//Define number of first slide view onload {curentSlide}
		this.params.currentSlide = this.offset		

		//Inject new Slider construct in this.scrollContainer
		for (const key in this.slideCollection) {
			if (Object.hasOwnProperty.call(this.slideCollection, key)) {
				const slideItem = this.slideCollection[key];	
				this.scrollContainer.insertAdjacentElement('beforeend',slideItem)					
			}
		}

	}

	/**
	 * Slide with wheel mouse
	 */

	slider(){

		window.addEventListener('mousewheel', this.debounce(function(e) {		

			if(e.deltaY > 0 ){	this.goToNext()	}
			else if(e.deltaY < 0){	this.goToPrev()	}

		},100).bind(this))
	}

	/**
	 * Use KeyBoard Arrow to slide
	 */
	keyBoardControl(){

	window.addEventListener('keyup', e =>{

		if(e.key === 'ArrowRight' || e.key === 'Right'){

			this.goToNext()
			
		}else if(e.key === 'ArrowLeft' || e.key === 'Left'){
			
			this.goToPrev()

		}

	})

	}

	/*Nav with link NAV */
	slideLink(){

	this.linkCollection.forEach(link => {

	link.addEventListener('click', (e)=>{

		e.preventDefault()

		const target = e.target
		const splitHref = target.getAttribute('href').split('_')
		this.params.currentSlide = parseInt(splitHref[1])
		if(this.params.jumpLink === false){
			this.goToSlide(this.params.currentSlide)
		}else{
			this.jumpToSlide(this.params.currentSlide)
		}

		this.linkToggleClass(this.params.currentSlide)

	})

	});

	} 

	/**
	 * Go directly to specific slide without animation
	 * @param {number} idx 
	 */

	jumpToSlide(idx){

		this.disabledTransition()
		const value = idx * this.params.slideWidth			
		this.scrollContainer.style.transform = `translate3d(-${value}vw,0,0)`	
		setTimeout(()=>{			
			this.enabledTransition()
		},100)

	}

	goToSlide(idx){

		const value = idx * this.params.slideWidth			
		this.scrollContainer.style.transform = `translate3d(-${value}vw,0,0)`	
		this.params.currentSlide = idx
		this.linkToggleClass(idx)

	}

	linkToggleClass(idx){

		document.querySelector('.active').classList.remove('active')		
		const thisLinkActive = document.querySelector(`[href=${this.params.sliderName}_${idx}]`)
		thisLinkActive.classList.add('active')

	}

	disabledTransition(){
		this.scrollContainer.style.transitionDuration = "0s"
	}

	enabledTransition(){
		this.scrollContainer.style.transitionDuration = `${this.params.slideTransition}s`
	}

	goToPrev(){

		const newScroll = this.params.currentSlide - 1

		if(this.params.infiniteLoop === false){

			if(newScroll >= this.idxLimitStart){
			this.goToSlide(newScroll)
			}

		}else if (this.params.infiniteLoop === true){

			if(newScroll >= this.idxLimitStart){
				this.goToSlide(newScroll)
			}else{

				this.jumpToSlide(this.idxEnd -1 )
				setTimeout(()=>{
					this.goToSlide(this.idxLimitEnd)
				},100)
			}
		}	
	}

	goToNext(){

	const newScroll = this.params.currentSlide + 1

	if(this.params.infiniteLoop === false){

		if(newScroll<= this.idxLimitEnd){
			this.goToSlide(newScroll)
		}

	}else if (this.params.infiniteLoop === true){

		if(newScroll<= this.idxLimitEnd){
			this.goToSlide(newScroll)
		}else{
			this.jumpToSlide(this.idxLimitStart - 1)
			setTimeout(()=>{
				this.goToSlide(this.idxLimitStart)
			},100)
		}
	}

	}

	debounce(callback,delay){

	let timer;
	return function(){
			let args = arguments;
			let context = this;
			clearTimeout(timer);
			timer = setTimeout(function(){
					callback.apply(context, args);
			}, delay)
	}

	}

	/**
	 * drad on touchScreen Mobil
	 */

	manageDrag(){

		/*
		this.scrollContainer.addEventListener('mousedown', e => 	this.startDrag(e) )
		window.addEventListener('mousemove' , e => 	this.drag(e) )
		window.addEventListener('mouseup' , e => 	this.endDrag(e)	)
		*/
		this.scrollContainer.addEventListener('dragstart', e => e.preventDefault() )
		this.scrollContainer.addEventListener('touchstart',e => 	this.startDrag(e)	)
		window.addEventListener('touchmove' , e => 	this.drag(e) )
		window.addEventListener('touchend' , e => 	this.endDrag(e)	)
		window.addEventListener('touchcancel' , e => 	this.endDrag(e)	)

	}

	/**
	 * Démarre le déplacement au touché
	 * @param {MouseEvent|TouchEvent} e 
	 */

	startDrag(e){
		if(e.touches) {  if(e.touches.length > 1){ return   }else{ e = e.touches[0] } }
		this.origin = {x : e.screenX, y : e.screenY}
		this.width = this.containerWidth
		this.disabledTransition()
	}

/**
 * 
 * @param {*} e 
 */

drag(e){
  if(this.origin){

    let point = e.touches ? e.touches[0] : e
    let translate = { x : point.screenX - this.origin.x, y : point.screenX - this.origin.y}		
		if(e.touches && Math.abs(translate.x) > Math.abs(translate.y)){

			e.preventDefault()
			e.stopPropagation()

		}
		let baseTranslate = this.params.currentSlide * -100 
		this.lastTranslate = translate
   	this.translate(baseTranslate +  ((100 * translate.x) / this.width))

  }
}

endDrag(e){

	if(this.origin && this.lastTranslate){

		this.enabledTransition()

		if(Math.abs(this.lastTranslate.x  / this.sliderOffsetWidth) > 0.2){
			if(this.lastTranslate.x < 0 ){				
				//Right slide start to end
				this.goToNext(this.params.currentSlide + 1)
				
			}else{				
				//Left slide start to end
				this.goToPrev(this.params.currentSlide - 1)
			}
		}else{
			this.goToSlide(this.params.curentSlide)
		}

	}

	this.origin = null

}

/**
 * @return number
 */

get containerWidth(){
  return this.slideWrapper.offsetWidth
}

get sliderOffsetWidth(){
	return this.slideWrapper.offsetWidth
}

translate(value){
//	console.log('on translate de ' , value+'vw');
	this.scrollContainer.style.transform = `translate3d(${value}vw , 0, 0)`
}

resizeSlider(){
		this.pushUpResize = false
		this.pushDownResize = false
		


		if(this.params.pushUp !== false && typeof(this.params.pushUp) === 'string'){

			const pushUpEl = document.querySelector(`${this.params.pushUp}`)
			this.pushUpVal = pushUpEl.offsetHeight 
			this.slideWrapper.style.top = `${this.pushUpVal}px`
			const sliderHeight = window.innerHeight - this.pushUpVal
			this.slideWrapper.style.height = `${sliderHeight}px`
			this.pushUpResize = true

		}		

		if(this.params.pushDown !== false && typeof(this.params.pushDown) === 'string'){

			console.log(`${this.params.pushDown}`);

			const pushDownEl = document.querySelector(`${this.params.pushDown}`)
			this.pushDownVal = pushDownEl.offsetHeight 
			this.slideWrapper.style.bottom = `${this.pushUpVal}px`
			this.pushDownResize = true

		}
}

}


const horizontalScroll = new ScrollHorizontalManager({

pushUp  : '.headerTop'



})

// avec le drag , le slide de fin revient sur le dernier puis slide sur le premier créer une
// méthode goToposition (this.translate - sliderWidth * nbSlide - 2 * this.offset)
// this.reallyNbSlide = nbSlide - 2 * this.offset

//Tenter de selectine les liens via le parent [].slice.call(parent)
