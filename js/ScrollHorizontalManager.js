debounce = (callback, delay) => {
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

class ScrollHorizontalManager{

	constructor(params = {}){	

		this.params = Object.assign({},{

			slideSize : 80,
			slideTransition : .3,
			slideLink : false,
			jumpLink : false,
			infiniteLoop : false,
			pushUp : false,
			pushDown : false,
			linkClassName : 'linkSlideHorizontal'

		},params)

		this.scrollContainer = document.querySelector('[horizontalScroll]')
		this.scrollContainer.style.transitionDuration = `${this.params.slideTransition}s`

		this.slide = document.querySelector('[slide]')
		this.allSlide = document.querySelectorAll('[slide]')
		this.nbSlide = this.allSlide.length
		this.lastSlideIdx = this.nbSlide - 1
		this.firstSlide = this.allSlide[0]
		this.lastSlide = this.allSlide[this.lastSlideIdx]
		
		this.currentTranslate = `translate(0px)`
		this.scroll = Math.ceil((window.innerWidth / 100) * this.params.slideSize)
		this.scrollContainer.style.transform = this.currentTranslate
		this.scrollLimit = (Math.ceil(this.scroll) * this.nbSlide) - Math.ceil(this.scroll)	
	
		this.drawSlider()
		this.keyBoardControl()
		this.slider()


		if(this.params.slideLink === true){
			this.allLink = document.querySelectorAll('[slideLink]')
			this.slideLink()
			this.allLink[0].classList.add(`${this.params.linkClassName}__active`) 
		}

		window.addEventListener('resize', debounce(()=>{
			this.transalteSlide(0)
			this.scroll = (window.innerWidth / 100) * this.params.slideSize
			this.scrollContainer.style.transform = this.currentTranslate
			this.scrollLimit = (Math.ceil(this.scroll) * this.nbSlide) - Math.ceil(this.scroll)	
			if(this.params.infiniteLoop === true){
				this.jumpToSlide(this.scroll)
			}

			if(this.params.slideLink === true){
				this.toggleLinkClass(0)
			}

		},300))

	}

	drawSlider(){

		this.pushUpResize = false
		this.pushDownResize = false
		


		if(this.params.pushUp !== false && typeof(this.params.pushUp) === 'string'){

			const pushUpEl = document.querySelector(`${this.params.pushUp}`)
			this.pushUpVal = pushUpEl.offsetHeight 
			this.scrollContainer.style.top = `${this.pushUpVal}px`
			this.pushUpResize = true

		}		

		if(this.params.pushDown !== false && typeof(this.params.pushDown) === 'string'){

			console.log(`${this.params.pushDown}`);

			const pushDownEl = document.querySelector(`${this.params.pushDown}`)
			this.pushDownVal = pushDownEl.offsetHeight 
			this.pushDownResize = true

		}		

		for(let count = 0 ; count < this.nbSlide ; count ++){

			console.log(this.allSlide[count]);

			this.allSlide[count].style.minWidth = `${this.params.slideSize}vw`

			if(this.allSlide[this.lastSlideIdx] && this.params.infiniteLoop === false){
				this.allSlide[this.nbSlide -1].style.minWidth = `100vw`
			}

			console.log(this.pushUpResize);
			console.log(this.pushDownResize);

			if(this.pushUpResize === true && this.pushDownResize === false){

				this.scrollContainer.style.height = `calc(100vh - ${this.pushUpVal}px)`
				this.allSlide[count].style.height = `calc(100vh - ${this.pushUpVal}px)`				

			}else if(this.pushUpResize === true && this.pushDownResize === true){				

				this.scrollContainer.style.height = `calc(100vh - ${this.pushUpVal}px - ${this.pushDownVal}px)`
				this.allSlide[count].style.height = `calc(100vh - ${this.pushUpVal}px - ${this.pushDownVal}px)`	

			}
		}

		if(this.params.infiniteLoop === true){			
			this.infiniteLoop()
		}
	}

	slider(){

		window.addEventListener('mousewheel', debounce(function(e) {

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

				if(this.params.slideLink === true){

					this.sectionIdx = Math.ceil((this.currentTranslate / this.scroll) + 1)
					if(this.sectionIdx <= this.nbSlide){

						this.toggleLinkClass(this.sectionIdx - 1)						

					}else{

						setTimeout( () => { this.toggleLinkClass(0) }, 200 )

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

					if(this.params.slideLink === true){					
	
						this.sectionIdx = Math.ceil((this.currentTranslate / this.scroll) - 1)
	
						if(this.sectionIdx > 0){						
							this.toggleLinkClass(this.sectionIdx - 1)					
						}else{
							setTimeout( () => { this.toggleLinkClass(this.nbSlide - 1)	}, 200 )
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

				console.log(e);
				console.log(count);

				

				let newScroll = 0
				const numberPattern = new RegExp(/\d+/g);
				this.currentTranslate = parseInt(this.scrollContainer.style.transform.match(numberPattern))

				if(this.params.infiniteLoop === false){
					newScroll = Math.ceil(this.scroll) * count
				}else{
					newScroll = (Math.ceil(this.scroll) * count) + this.scroll
				}
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

		this.slide = document.querySelector('.slide')
		this.allSlide = document.querySelectorAll('.slide')
		this.nbSlideLoop = this.allSlide.length

		this.scrollLimit = (Math.ceil(this.scroll) * this.nbSlideLoop) - Math.ceil(this.scroll)
		this.jumpToSlide(this.scroll)		
	}

	//utils

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


}



new ScrollHorizontalManager({
	slideSize : 95,
	pushUp : '.headerTop',
	slideLink : true,
	infiniteLoop : true,
})