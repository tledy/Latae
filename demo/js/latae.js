/**
 *
 *  Plugin LATAE  1.0 15/09/2015
 *  Author: Tony Sahraoui
 *  
 */

(function($){
    $.fn.extend({ 
        latae: function(options)
        {
            var defaults =
            {
                max_height  : 350,
                margin      : 4,
                target      : 'picture',
                loader      : 'img/loader.gif',
                displayTitle: false
            };

            var m_options = $.extend(defaults, options);
                
            return this.each(function() 
            {
                var regs = m_options;
                var obj = $(this);
                
                var gallery = {
                    nb_picts  : 0,      // Nombre total d'images
                    picts     : {},     // Objets images
                    width     : 0,      // Largeur du conteneur
                    load_index: 0,      // Index de comptage des images chargees
                    loader    : null,   // Loader
                    line      : {       // Ligne d'affichage 
                        items   : [],     // Objets image 
                        height  : regs.max_height, // Hauteur de la plus petite image, par dÃ©faut hauteur max
                        width   : 0       // Largeur courrante 
                    },  
                    
                    /**
                     * Initialisation du module
                     */ 
                    init : function(){
                        // Initialisation des images             
                        gallery.initPictures();

                        // Initialisation des variables du module
                        gallery.picts = $('figure.' + regs.target);
                        gallery.width = Math.floor(obj.width());
                        gallery.nb_picts = gallery.picts.length;
                            
                        // Réglages des propriétés du conteneur 
                        gallery.setGalleryProperties();

                        // Contruction du loader
                        gallery.buildLoader();

                        // Masquage des images
                        gallery.hidePictures();

                        // Gestion de l'affichage des titres des images
                        gallery.initDisplayFigcaption();

                        // Initialisation des ecouteurs d'evenements
                        gallery.initTriggers();

                        // Evenement init sur object Gallery
                        obj.trigger('init', obj);
                    },

                    /**
                     * Construction des elements DOM <figure>
                     */
                    initPictures : function(){
                        obj.find('.' + regs.target).each(function() {
                            var elem = $(this);

                            // Si l'element est un element de type img
                            if (elem.is('img')){
                                var url = elem.attr('src');
                                var title = (elem.attr('alt') != undefined && elem.attr('alt') != '') ?
                                            elem.attr('alt') :
                                            (
                                                (elem.data('title') != undefined && elem.data('title') != '') ?
                                                elem.data('title') :
                                                ''
                                            );

                                var o_figure = $('<figure>', { 'data-url': url, class: regs.target });
                                gallery.addFigureProperties(o_figure);
                                var o_figcaption = $('<figcaption>');
                                gallery.addFigcaptionProperties(o_figcaption);
                                o_figcaption.html(title);
                                
                                o_figure.append(o_figcaption);
                                elem.after(o_figure);

                                elem.remove();
                            }
                            // Si l'element est un element de type figure
                            else if (elem.is('figure')){
                                gallery.addFigureProperties(elem);
                                var title = (elem.data('title') != undefined && elem.data('title') != '') ?
                                            elem.data('title') :
                                            '';
                                var o_figcaption = $('<figcaption>');
                                gallery.addFigcaptionProperties(o_figcaption);
                                
                                o_figcaption.html(title);
                                elem.append(o_figcaption);
                            }
                        });
                    },

                    /**
                     * Adaptation des proprietes du conteneur
                     */
                    setGalleryProperties : function(){
                        var width = obj.width();
                        gallery.width = width;
                        obj.css({ 'boxSizing' : 'content-box', width : width });
                    },

                    /**
                     * Ajout des proprietes CSS à la balise figcaption
                     */
                    addFigureProperties : function(o_figure){
                        var defaults = { 
                            position: 'relative',
                            float: 'left', 
                            height: 'auto',
                            margin: '0 0 4px 0',
                            width: 'auto'
                        };
                        var properties = $.extend(defaults, regs.figure);

                        o_figure.css(properties);
                    },

                    /**
                     * Ajout des proprietes CSS à la balise figcaption
                     */
                    addFigcaptionProperties : function(o_figcaption){
                        var defaults = { 
                            display: 'none', 
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '100%', 
                            'text-align': 'center', 
                            backgroundColor: "rgba(0,0,0,0.3)",
                            color: '#fff',
                            padding: '5px 0'
                        };
                        var properties = $.extend(defaults, regs.figcaption);

                        o_figcaption.css(properties);
                    },

                    /**
                     * Affichage de la balise figcaption au survol de l'image
                     */
                    initDisplayFigcaption : function(){
                        if (regs.displayTitle) {
                            gallery.picts.bind({
                                mouseenter: function(){ 
                                    $(this).find('figcaption').slideDown();
                                },
                                mouseleave: function() {
                                    $(this).find('figcaption').slideUp();
                                }
                            });  
                        }
                    },

                    /**
                     * Construction du loader
                     */
                    buildLoader : function(){
                        var o_loader = $('<div>', { class: 'loader'});
                        // Ajout des proporietes CSS au loader
                        o_loader.css({
                            position: 'relative',
                            textAlign: 'center',
                            width: '100%'
                        });
                        // Création de l'image contenu dans l'element DOM loader
                        var o_img = $('<img>', { src: regs.loader });
                        // Ajout des propriétés CSS à l'image 
                        o_img.css({
                            display: 'block',
                            margin: '0 auto',
                            position: 'relative'
                        });
                        o_loader.append(o_img);

                        gallery.loader = o_loader;
                        
                        // Insertion du loader dans le container
                        obj.append(gallery.loader);
                    },

                    /**
                     * Remise a  zero du module et lancement
                     */
                    restart : function(){
                        // Initialisation des variables du module
                        gallery.setGalleryProperties();
                        gallery.load_index = 0;
                        // Retrait des marges 
                        gallery.picts.css('marginRight', 0);
                        
                        // Masquage des images
                        gallery.hidePictures();
                        
                        gallery.line = {
                            items : [], 
                            height : regs.max_height, 
                            width : 0 
                        };

                        // Evenement restart
                        obj.trigger('restart', obj);
                    },

                    /**
                     * Masquage des images au chargement de la page
                     */
                    hidePictures : function(){
                        // Suppression des images generees si presentes
                        obj.find('.picture img').remove();

                        obj.find('.picture').hide();
                    },

                    /**
                     * Construction d'une ligne d'images
                     */
                    buildLine : function(){
                        // Adaptation des dimensions des images de la ligne
                        gallery.redimLinePicts();

                        var margins = (gallery.line.items.length - 1) * parseInt(regs.margin);

                        // Si la ligne est moins large que le conteneur, on charge une autre image 
                        if ((gallery.line.width + margins) > gallery.width){
                            var coeff = (gallery.width - margins) / gallery.line.width;
                            
                            gallery.displayLine(coeff, true);
                            gallery.clearLine();
                        }

                        else if (gallery.load_index == gallery.nb_picts) {
                            gallery.displayLine(1, false);
                            gallery.clearLine();
                        }

                        gallery.loadPicture();
                    },

                    /**
                     * Reinitialise la ligne
                     */
                    clearLine : function(){
                        gallery.line.items  = [];
                        gallery.line.height = regs.max_height;
                        gallery.line.width  = 0;
                    },

                    /** 
                     * Affiche la ligne d'images
                     *
                     * @param float coeff Coefficient a  appliquer sur les dims des images
                     */
                    displayLine : function(coeff, adjust){
                        var c = coeff || 1;
                        gallery.line.width = 0;
                        var count = gallery.line.items.length;

                        for(i in gallery.line.items){
                            var item = gallery.line.items[i];
                            var elem = item.picture;
                            var image = item.picture.find('img');
                            var i_height = Math.ceil(item.height * c);
                            var i_width = Math.ceil(item.width * c);
                            
                            gallery.line.width += i_width;

                            // On ajuste la taille de la derniÃ¨re image 
                            if (i == count - 1 && adjust == true) {
                                var adjust_x = gallery.line.width - gallery.width + ((count - 1) * regs.margin); 
                                i_width -= adjust_x;
                            }

                            image.attr('height', i_height);
                            image.attr('width', i_width);
                            image.css({ display: 'block' });

                            if (count > 1 && i != (count - 1))
                                elem.css('marginRight', regs.margin);

                            elem.show();
                        };
                    },

                    /**
                     * Redimensionne les images en fonction de la hauteur de l'image la plus petite
                     */
                    redimLinePicts : function(){
                        // Remise Ã  zÃ©ro de la largeur de la ligne
                        gallery.line.width = 0;
                        var count = gallery.line.items.length;

                        for (i in gallery.line.items) {
                            var item = gallery.line.items[i];

                            // Si l'image est plus petite que la hauteur de la ligne
                            if (item.height < gallery.line.height) {
                                gallery.line.height = item.height;
                                // On redefini la hauteur de la ligne, et on redimensionne les images
                                gallery.redimLinePicts();
                                return false;
                            } 
                            else {
                                // Si l'image est plus haute, on adapte ses dimensions
                                if (item.height > gallery.line.height) {
                                    var coeff = gallery.line.height / item.height;
                                    item.height = gallery.line.height;
                                    item.width = Math.floor(item.width * coeff);
                                }

                                // On ajoute la largeur de l'image a celle de la ligne
                                gallery.line.width += item.width;
                            }
                        };
                    },

                    /**
                     * Chargement d'une image
                     */
                    loadPicture : function(){
                        var item_line = {}; 
                        item_line.picture = $(gallery.picts[gallery.load_index]) || null;
                        gallery.load_index++;

                        if (item_line.picture.length == 0)
                            return false;

                        var url = item_line.picture.data('url').replace(/(^url\()|(\)$|[\"\'])/g, '');
                        var o_image = $('<img>');
                        o_image.appendTo(item_line.picture);
                        
                        var _img = new Image();
                        
                        _img.onload = function() { 
                            // Apres le chargement des images, on masque le loader
                            if (gallery.load_index == (gallery.nb_picts - 1))
                                gallery.loader.hide();
                        
                            o_image.attr('src', url);
                            
                            // Recuperation des dimensions de l'image
                            item_line.height = (_img.height > regs.max_height) ? regs.max_height : _img.height;
                            item_line.width = (_img.height > regs.max_height) ? 
                                              Math.floor((regs.max_height / _img.height) * _img.width) : 
                                              _img.width;
                            // Ajout de l'image a  la ligne en cours
                            gallery.line.items.push(item_line);

                            obj.trigger('loadPicture', o_image);
                        }

                        _img.src = url;
                    },
                
                    /**
                     * Initialisation des ecouteurs d'evenements
                     */
                    initTriggers : function(){
                        obj.bind('init', function(event) { 
                            gallery.loadPicture();

                            // Si un callback init() est défini
                            if (regs.init && $.isFunction(regs.init))
                                regs.init(event, gallery);
                        });

                        obj.bind('restart', function(event) { 
                            gallery.loadPicture(); 

                            if (regs.resize && $.isFunction(regs.resize))
                                regs.resize(event, gallery);
                        });

                        obj.bind('loadPicture', function(event, img) { 
                            gallery.buildLine(); 

                            if (regs.loadPicture && $.isFunction(regs.loadPicture))
                                regs.loadPicture(event, img);
                        });

                        // Redimentionnement fenetre
                        var rtime;
                        var timeout = false;
                        var delta = 200;
                        $(window).resize(function() {
                            rtime = new Date();
                            if (timeout === false) {
                                timeout = true;
                                setTimeout(resizeEnd, delta);
                            }
                        });

                        function resizeEnd() {
                            obj.css('width', '');
                            if (new Date() - rtime < delta) {
                                setTimeout(resizeEnd, delta);
                            } else {
                                timeout = false;
                                gallery.restart();
                            }               
                        }
                    },
                };
                
                // Initialisation de la galerie
                $(function(){ gallery.init(); });  
            });
        }
    });
})(jQuery);
