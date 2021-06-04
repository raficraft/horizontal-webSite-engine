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

			slideXWithMouseWheel : true,
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


		this.slideWrapper = document.querySelector(`[data-${this.params.sliderName}]`)
		this.scrollContainer = document.querySelector(`[data-${this.params.sliderName}Container]`)

		this.slideCollection = document.querySelectorAll(`[data-${this.params.sliderName}Slide]`)
		this.nbSlide = this.slideCollection.length

		this.offset = 0

		if(this.params.slideLink === true){
			this.linkCollection = document.querySelectorAll(`[data-${this.params.sliderName}Link]`)
			this.slideLink()
			this.linkCollection[0].classList.add(`active`) 
		}

		this.slideView = 1

		console.log(this);

		this.drawSliderPage()
		this.keyBoardControl()
		this.slider()

	}

	//ENGINE

	drawSliderPage(){

		//presence of a header
		//presence of a footer

		const {linkCollection } = this	

		this.slideView = parseInt(Math.round(100 / this.params.slideWidth))

		console.log(100 / this.params.slideWidth);
		console.error(this.slideView);

		//get number of slide view to add

		if(this.params.infiniteLoop === true){
			this.infiniteLoop()
		}	

		//Define width of parent container of slide
		this.widthContainer = `${(this.nbSlide * this.params.slideWidth)}vw `		
		this.scrollContainer.style.width = this.widthContainer 
		this.scrollContainer.style.transitionDuration = `0s`

		//Define width && id of Slide && inject this to the parent container

		console.error(this.nbSlide);

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
		
		console.log(typeof(addSlide));
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

	slider(){

		window.addEventListener('mousewheel', this.debounce(function(e) {		

			if(e.deltaY > 0 ){


				this.goToPrev()
			

			}else if(e.deltaY < 0){

				this.goToNext()
			
			}

		},100).bind(this))
	}

	keyBoardControl(){

		window.addEventListener('keyup', e =>{

			if(e.key === 'ArrowRight' || e.key === 'Right'){

				this.goToPrev()

			}else if(e.key === 'ArrowLeft' || e.key === 'Left'){

				this.goToNext()

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
	

	jumpToSlide(idx){

		this.disabledTransition()
		const value = idx * this.params.slideWidth			
		this.scrollContainer.style.transform = `translate(-${value}vw)`	
		setTimeout(()=>{			
			this.enabledTransition()
		},100)

	}

	goToSlide(idx){

		console.log('go To :' , idx);

		const value = idx * this.params.slideWidth			
		this.scrollContainer.style.transform = `translate(-${value}vw)`	
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

	goToNext(){

		const idxEnd = this.nbSlide - 1 //extrémité du slide ajouté

		const idxLimitStart = this.offset //Début du slide
		const idxLimitEnd = idxEnd - this.offset // fin du slide


		const newScroll = this.params.currentSlide - 1

		if(this.params.infiniteLoop === false){

			if(newScroll >= idxLimitStart){
			this.goToSlide(newScroll)
			}



		}else if (this.params.infiniteLoop === true){

			if(newScroll >= idxLimitStart){
				this.goToSlide(newScroll)
			}else{

				this.jumpToSlide(idxEnd -1 )
				setTimeout(()=>{
					this.goToSlide(idxLimitEnd)
				},100)
			}

		}	

	}

	goToPrev(){

		const idxEnd = this.nbSlide - 1 //extrémité du slide ajouté
		const idxLimitEnd = idxEnd - this.offset // fin du slide

		const newScroll = this.params.currentSlide + 1

		if(this.params.infiniteLoop === false){

			if(newScroll<= idxLimitEnd){
				this.goToSlide(newScroll)
			}

		}else if (this.params.infiniteLoop === true){

			if(newScroll<= idxLimitEnd){
				this.goToSlide(newScroll)
			}else{
				this.jumpToSlide(this.offset - 1)
				setTimeout(()=>{
					this.goToSlide(this.offset)
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
}


const horizontalScroll = new ScrollHorizontalManager({





})
