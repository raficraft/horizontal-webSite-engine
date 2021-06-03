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
			silder : true,
			sliderName : 'horizontalScroll',

			slideSize : 80,
			slideTransition : .3,

			slideLink : false,
			jumpLink : false,
			infiniteLoop : false,

			pushUp : false,
			pushDown : false,

			linkClassName : 'linkSlideHorizontal',
			linkClassRemove : true,

		},params)


		console.log(this.params);


		this.allSlide = document.querySelectorAll(`[data-slide="${this.params.sliderName}"]`)
		this.nbSlide = this.allSlide.length
		this.lastSlideIdx = this.nbSlide - 1
		this.firstSlide = this.allSlide[0]
		this.lastSlide = this.allSlide[this.lastSlideIdx]

		this.currentTranslate = 0
		this.scrollContainer = document.querySelector(`[data-${this.params.sliderName}]`)
		this.scrollContainer.style.transitionDuration = `${this.params.slideTransition}s`
		this.scrollContainer.style.transform = `translate(${this.currentTranslate}px)`
		this.scroll = Math.ceil((this.scrollContainer.offsetWidth / 100) * this.params.slideSize)
		console.log(this.scroll);
		this.scrollLimit = (Math.ceil(this.scroll) * this.nbSlide) - Math.ceil(this.scroll)	

		console.log(this.scrollContainer.offsetWidth * this.nbSlide);	

		//Système Conditionelle is hover

		this.drawSliderPage()
		this.keyBoardControl()
		if(this.params.slider === true){

			console.log('slider on');
			this.scrollContainer.style.position = 'fixed'
			this.slider()

		}else{
			this.scrollContainer.style.position = 'absolute'
		}


		if(this.params.slideLink === true){
			this.allLink = document.querySelectorAll('[slideLink]')
			this.slideLink()
			this.allLink[0].classList.add(`${this.params.linkClassName}__active`) 
		}


		window.addEventListener('resize', this.debounce(()=>{

			new ScrollHorizontalManager(this.params)	

		},300))

	}

	//ENGINE

	drawSliderPage = () => {

		this.pushUpResize = false
		this.pushDownResize = false
		


		if(this.params.pushUp !== false && typeof(this.params.pushUp) === 'string'){

			const pushUpEl = document.querySelector(`${this.params.pushUp}`)
			if(pushUpEl){
			this.pushUpVal = pushUpEl.offsetHeight 
			this.scrollContainer.style.top = `${this.pushUpVal}px`
			this.pushUpResize = true
			}else{
				console.error(`Element HTML , ${this.params.pushUpEL} non présent`);
			}


		}		

		//Présence d'un footer

		if(this.params.pushDown !== false && typeof(this.params.pushDown) === 'string'){

			console.log(`${this.params.pushDown}`);

			const pushDownEl = document.querySelector(`${this.params.pushDown}`)
			if(pushDownEl){
			this.pushDownVal = pushDownEl.offsetHeight 
			this.pushDownResize = true
			}else{
				console.error(`Element HTML , ${this.params.pushDown} non présent`);
			}

		}		

		for(let count = 0 ; count < this.nbSlide ; count ++){

			console.log(this.allSlide[count]);

			this.allSlide[count].style.minWidth = `${this.params.slideSize}vw`

			if(this.allSlide[this.lastSlideIdx] && this.params.infiniteLoop === false){
				this.allSlide[this.nbSlide -1].style.minWidth = `100vw`
			}

			//console.log(this.pushUpResize);
		//	console.log(this.pushDownResize);

			if(this.pushUpResize === true && this.pushDownResize === false && this.params.slider === true){

				this.scrollContainer.style.height = `calc(100vh - ${this.pushUpVal}px)`
				this.allSlide[count].style.height = `calc(100vh - ${this.pushUpVal}px)`			

			}else if(this.pushUpResize === true && this.pushDownResize === true && this.params.slider === true){				

				this.scrollContainer.style.height = `calc(100vh - ${this.pushUpVal}px - ${this.pushDownVal}px)`
				this.allSlide[count].style.height = `calc(100vh - ${this.pushUpVal}px - ${this.pushDownVal}px)`	

			}
		}

		if(this.params.infiniteLoop === true){			
			this.infiniteLoop()
		}
	}

	slider(){

		window.addEventListener('mousewheel', this.debounce(function(e) {

			const numberPattern = new RegExp(/\d+/g);
			this.currentTranslate = parseInt(this.scrollContainer.style.transform.match(numberPattern))
			let newScroll = 0			

			if(e.deltaY > 0 ){

				newScroll =  Math.ceil(this.currentTranslate) + Math.ceil(this.scroll)


				if(newScroll <= this.scrollLimit && this.params.infiniteLoop === false || newScroll < this.scrollLimit && this.params.infiniteLoop === true) {
					this.transalteSlide(newScroll)
				}else if(newScroll >= (this.scrollLimit - this.scroll) && this.params.infiniteLoop === true){					
					this.jumpToSlide(0)
					setTimeout(()=>{
						this.transalteSlide(this.scroll)
					},150)
				}

				// Link Style Management

				if(this.params.slideLink === true){

					this.sectionIdx = (this.currentTranslate / this.scroll) + 1
					if(this.sectionIdx <= this.nbSlide){

						this.toggleLinkClass(this.sectionIdx - 1)						

					}else{

						setTimeout( () => { this.toggleLinkClass(0) }, 200 )

					}	
				}

			}else if (e.deltaY < 0){

				if(this.params.infiniteLoop === false){
					newScroll =  Math.ceil(this.currentTranslate) - Math.ceil(this.scroll)
					this.transalteSlide(newScroll)
				}		

				if(this.params.infiniteLoop === true){
					newScroll =  Math.ceil(this.currentTranslate) - Math.ceil(this.scroll)
					if(newScroll > 0){
						this.transalteSlide(newScroll)
					}else{
						this.jumpToSlide(this.scrollLimit)
						setTimeout(()=>{
							this.transalteSlide(this.scrollLimit - this.scroll)
						},150)
					}
				}

				// link Style Management

				if(this.params.slideLink === true){					
	
					this.sectionIdx = (this.currentTranslate / this.scroll) - 1

					if(this.sectionIdx > 0){						
						this.toggleLinkClass(this.sectionIdx - 1)					
					}else{
						setTimeout( () => { this.toggleLinkClass(this.nbSlide - 1)	}, 200 )
					}
	
				}
		}

		},100).bind(this))
	}

	keyBoardControl(){	

		window.addEventListener('keyup',e =>{

			const numberPattern = new RegExp(/\d+/g);
			this.currentTranslate = parseInt(this.scrollContainer.style.transform.match(numberPattern))
			let newScroll = 0


			if(e.key === 'ArrowRight' || e.key === 'Right'){

				newScroll =  Math.ceil(this.currentTranslate) + Math.ceil(this.scroll)
				if(newScroll <= this.scrollLimit && this.params.infiniteLoop === false || newScroll < this.scrollLimit && this.params.infiniteLoop === true) {
					this.transalteSlide(newScroll)
				}else if(newScroll >= (this.scrollLimit - this.scroll) && this.params.infiniteLoop === true){					
					this.jumpToSlide(0)
					setTimeout(() => { this.transalteSlide(this.scroll) }, 200 )
				}

				// link Style Management

				if(this.params.slideLink === true && this.params.infiniteLoop === true){

					this.sectionIdx = Math.ceil((this.currentTranslate / this.scroll) + 1)
					if(this.sectionIdx <= this.nbSlide){

						this.toggleLinkClass(this.sectionIdx - 1)						

					}else{

						setTimeout( () => { this.toggleLinkClass(0) }, 200 )

					}	

				}else if(this.params.slideLink === true && this.params.infiniteLoop === false){

					this.sectionIdx = Math.ceil((this.currentTranslate / this.scroll) + 1);

					if(this.sectionIdx < this.nbSlide){
						this.toggleLinkClass(this.sectionIdx)	
					}
				}
				
			}else  if(e.key === 'ArrowLeft' || e.key === 'Left'){

				if(this.params.infiniteLoop === false){
					newScroll =  Math.ceil(this.currentTranslate) - Math.ceil(this.scroll)
					this.transalteSlide(newScroll)
				}else{

					newScroll =  Math.ceil(this.currentTranslate) - Math.ceil(this.scroll)
					if(newScroll > 0){
					this.transalteSlide(newScroll)
					}else{
						this.jumpToSlide(this.scrollLimit)
						setTimeout(() => { this.transalteSlide(this.scrollLimit - this.scroll) }, 200 )
					}

				}

					// link Style Management

					if(this.params.slideLink === true && this.params.infiniteLoop === true){					
	
						this.sectionIdx = Math.ceil((this.currentTranslate / this.scroll) - 1)
	
						if(this.sectionIdx > 0){						
							this.toggleLinkClass(this.sectionIdx - 1)					
						}else{
							setTimeout( () => { this.toggleLinkClass(this.nbSlide - 1)	}, 200 )
						}
		
					}else if(this.params.slideLink === true && this.params.infiniteLoop === false){

						this.sectionIdx = Math.ceil((this.currentTranslate / this.scroll) - 1);

						if(this.sectionIdx >= 0){
							this.toggleLinkClass(this.sectionIdx)	
						}
				}
				
					
			}
		})
	}

	slideLink(){

		const countLink = this.allLink.length

		for(let count = 0 ; count < countLink ; count++){

			this.allLink[count].addEventListener('click', (e)=>{

				e.preventDefault()

				let newScroll = 0
				const numberPattern = new RegExp(/\d+/g);
				this.currentTranslate = parseInt(this.scrollContainer.style.transform.match(numberPattern))

				if(this.params.infiniteLoop === false){
					newScroll = Math.ceil(this.scroll) * count
				}else{
					newScroll = (Math.ceil(this.scroll) * count) + this.scroll
				}

				console.log(this.params.jumpLink);

				if(this.params.jumpLink === false){
					this.transalteSlide(newScroll)
				}else{
					this.jumpToSlide(newScroll)
				}

				this.sectionIdx = count
				this.toggleLinkClass(this.sectionIdx)

			})

		}
	}

	infiniteLoop(){

		const cloneFirstSlide = this.firstSlide.cloneNode(true)
		const cloneLastSlide = this.lastSlide.cloneNode(true)

		this.scrollContainer.insertAdjacentElement('afterbegin',cloneLastSlide)
		this.scrollContainer.insertAdjacentElement('beforeEnd',cloneFirstSlide)

		this.allSlide = document.querySelectorAll('.slide')
		this.nbSlideLoop = this.allSlide.length

		this.scrollLimit = (Math.ceil(this.scroll) * this.nbSlideLoop) - Math.ceil(this.scroll)
		this.jumpToSlide(this.scroll)		
	}

	//UTILS

	transalteSlide(value){
		this.scrollContainer.style.transform = `translate(-${value}px)`
	}

	jumpToSlide(value){
		this.disabledTransition()
		this.scrollContainer.style.transform = `translate(-${value}px)`
		setTimeout(()=>{			
			this.enabledTransition()
		},100)
		
	}

	toggleLinkClass(linkIdx){

		console.log(linkIdx);

		document.querySelector('.linkSlideHorizontal__active').classList.remove('linkSlideHorizontal__active')
		this.allLink[linkIdx].classList.add(`${this.params.linkClassName}__active`) 

	}

	disabledTransition(){
		this.scrollContainer.style.transitionDuration = "0s"
	}

	enabledTransition(){
		this.scrollContainer.style.transitionDuration = `${this.params.slideTransition}s`
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
}

const horizontalScroll = new ScrollHorizontalManager({
	slideSize : 50,
	slider : false,
	pushUp : '.headerTop',
	slideLink : true,
	jumpLink : false,
	infiniteLoop : false,
})



console.log(horizontalScroll);


//Ajoute des slide à chaque redimensionnement
//Retirer les slide au redimensionnement 
// Conserver le silde active en mémoire


/*
class ToucheEventManager extends ScrollHorizontalManager{



	constructor(){
		super()


				this.scrollContainer.addEventListener('mousemove',(e) => { this.dragSlide(e) })
		this.scrollContainer.addEventListener('mousedown',(e) => { this.startDrag(e) })



		
	}

	startDrag(e){
		this.origin = {x : e.clientX , y : e.clientY}
		console.log(this.currentTranslate);
		
	//	console.log(this.origin);
	}

	dragSlide(e){
		let point = e
		let translate = {x : point.clientX - this.origin.x , y : point.clientY - this.origin.y}
	/*	
		console.log(this.scroll);*/
	/*	console.log(translate.x);
		console.log(this.pointZero);*/
 /* 	console.error((this.currentTranslate - translate.x));

		this.transalteSlide(this.currentTranslate - translate.x)
		

	}



}*/
