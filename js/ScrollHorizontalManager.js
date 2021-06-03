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
		}

		console.log(this);

		this.drawSliderPage()



	}

	//ENGINE

	drawSliderPage(){

		//presence of a header
		//presence of a footer

		const { nbSlide,container, linkCollection } = this	

		//get number of slide view to add

		if(this.params.infiniteLoop === true){
			this.infiniteLoop()
		}	

		//Define width of parent container of slide
		this.widthContainer = `${(this.nbSlide * this.params.slideWidth)}% `		
		this.scrollContainer.style.width = this.widthContainer 
		this.scrollContainer.style.transitionDuration = `0s`

		//Define width && id of Slide && inject this to the parent container

		console.error(this.nbSlide);

		for (const key in this.slideCollection) {
			if (Object.hasOwnProperty.call(this.slideCollection, key)) {

				const slideItem = this.slideCollection[key];
				slideItem.style.minWidth = `${this.params.slideWidth}%`
				slideItem.setAttribute('id',`${this.params.sliderName}_${key}`)	
				
				//Resize lastSlide if infiniteLoop = false
				if(parseInt(key) === parseInt(this.nbSlide) - 1 && this.params.infiniteLoop === false && this.params.slideWidth < 100){
					slideItem.style.minWidth = `100%`
				}
				
			}
		}

		//Associate anchor link with slide ID
		if(this.params.slideLink === true){
			for (const key in linkCollection) {
				if (Object.hasOwnProperty.call(linkCollection, key)) {
					const link = linkCollection[key];

					link.setAttribute('href',`${this.params.sliderName}_${parseInt(key) + this.offset}`)					
					
				}
			}
		}

		this.goToSlide(this.params.currentSlide)
		setTimeout(()=>{
			this.enabledTransition()
		},0)
		this.spy()
	
	}

	infiniteLoop(){

		//Remove old original HTML contenant
		for (const item of this.slideCollection) {	
			item.remove()			
		}

		const addSlide = parseInt(Math.round(100 / this.params.slideWidth))
		console.log(typeof(addSlide));
		this.offset = Math.round(addSlide * 1)
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

	/*Nav with link NAV */
	slideLink(){

		this.linkCollection.forEach(link => {

			link.addEventListener('click', (e)=>{

				e.preventDefault()

				const target = e.target
				const splitHref = target.getAttribute('href').split('_')
				this.params.currentSlide = parseInt(splitHref[1])
				this.goToSlide(this.params.currentSlide)

			})
			
		});

	}


	keyBoardControl(){

	}

	goToSlide(idx){

		const value = idx * this.params.slideWidth
		this.scrollContainer.style.transform = `translate(-${value}%)`
		this.spy()

	}




	spy(){
		console.log('############################################');
		console.log(this.params);
		console.log(this);
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





})
