# horizontal-weSite-engine

Moteur de scrolling horizontal. Ce Script javascript va vous permmettre d'imbriquer votre site dans un gestionnaire de scroll horizontal afin de proposer à vos utilisateur un epéreince original.

L'on peut détourné le script de son usage originel et en faire un simple carousel d'image. ^^


  <br>
  <hr>
 <br>

 ![socialCard](https://raficraft.github.io/horizontal-webSite-engine/assets/social/socialCard.JPG)


## Mise en place

  Dans votre fichier HTML
  ```HTML      

    <Container data-hs>

        <!-- Insertion des icones de navigation //optionel -->
      <span data-hsprev> </span>
      <span data-hsnext> </span>

       <section data-hsContainer>
          <!-- Section du site-->
        <ChildContainer ></ChildContainer>
        <ChildContainer ></ChildContainer>
        <ChildContainer ></ChildContainer>
        [...]
      </section>

    </Container>

  ```

  <br>
<hr>
 <br>

## Paramètres

   ```js

        slideXWithMouseWheel: true,
        sliderName: "hs",
        currentSlide: 0,
        infiniteLoop: true,
        slideWidth: 95,
        slideTransition: "0.3",
        slideLink: true,
        jumpLink: false,
        pushUp: false, //Prise en compte de la hauter d'un header
        puhsDown: false, //Prise en compte de la hauter d'un footer
        linkClassName: "linkSlideHorizontal",
   
   ```



