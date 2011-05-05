(function($) {
    $.jQPad = function(options) {
        var defaults = {
            siteName: "jQPad",
            defaultHomeTitle: "Home",
            defaultPage: "content/default/",
            ajax: {
                cache: true,
                defaultNavMethod: true
            },
            splash: "misc/jqpad-splash.png",
            icon: "misc/jqpad-icon.png"
        }
        var settings = $.extend({},
        defaults, options);
        $(document).ready(function() {
            jqpadAjax({
                cache: settings.ajax.cache,
                defaultNavMethod: settings.ajax.defaultNavMethod
            });
            linksInLists();
            hidePanels();
            clearForm();
            closePanel();
            clickTitle();
            scrollable();
            backButton();
            appendSpaceAfterContent();
            deletable();
            numberLists();
            resizeBody();
            updateOrien();
            changeNavPanelTitle();
            changeTitlesToDefault();
            loadDefaultPage();
            iterateListsForIds();
            menuSelection(".content-left .content-main .nav");
        });


        // /***************** Orientation Changes and body resizing *****************/
        // 
        // function resizeBody() {
        //     //Resize window with Javascript
        //     //Get dimensions
        //     var bodyHeight = $(window).height();
        //     var bodyWidth = $(window).width();
        //     //Split into Columns. Left 1/3 of window and right rest.
        //     var leftColumn = bodyWidth / 3;
        //     var rightColumn = bodyWidth - leftColumn - 1;
        //     var contentMain = bodyHeight - 60;
        //     //@implementation
        //     $(".content-left").css({
        //         "width": leftColumn,
        //         "height": bodyHeight
        //     });
        //     $(".content-right .scroll-wrapper,").css({
        //         "width": rightColumn,
        //         "height": bodyHeight
        //     });
        //     $(".content-left .scroll-wrapper,").css({
        //         "width": leftColumn,
        //         "height": bodyHeight
        //     });
        //     $(".content-right").css({
        //         "width": rightColumn
        //     });
        //     $(".content-left .content-main, .content-right .content-main").css({
        //         "min-height": contentMain
        //     });
        // }
        // 
        // //When iPad's orientations changes.
        // function orientationChange() {
        //     var ipadOrientation = window.orientation;
        //     switch (ipadOrientation) {
        //     case 0:
        //         resizeBody();
        //         break;
        // 
        //     case 90:
        //         resizeBody();
        //         break;
        // 
        //     case - 90:
        //         resizeBody();
        //         break;
        // 
        //     case 180:
        //         resizeBody();
        //         break;
        //     }
        // }
        // 
        // //Call update on orientation when change
        // function updateOrien() {
        //     window.onorientationchange = orientationChange;
        // }

        /***************** @end *****************/

        /***************** Locationing *****************/
        //If, wehn page loads, there is a location
        //after the hash tag, we load it.
        $(document).ready(function() {
            var loc = window.location.hash;
            if (loc) {
                loc = loc.replace("#", "");
                displayLoading(true);

                $.ajax({
                    url: "content/" + loc,
                    success: function(data) {
                        displayLoading(false);
                        $(".content-right .content-main").html(data);
                        functionsAfterLoading("");
                    }
                });
            }
        });

        /***************** Tab Bar on left *****************/
        function iterateListsForIds() {
            var li = $(".content-left .content-main .nav li").length;
            for (var i = 0; i <= li; i++) {
                //To create ID's for features later or for modding/styling
                $(".content-left .content-main .nav li:eq(" + i + ")").attr("class", "menuItem" + (i + 1));
            }
        }

        function menuSelection(selector) {
            $(selector + " li a").live("click",
            function() {
                updateMenuSelected(selector);
                $(this).parent().parent().addClass("tapped");
                $(this).css({
                    "color": "#FFFFFF",
                    "text-shadow": "0px 1px 0px #9F9F9F"
                });
            });
        }

        function updateMenuSelected(selector) {
            var isHighlighted = $(selector).find(".tapped").length;
            if (isHighlighted > 0) {
                $(selector).find(".tapped").removeClass("tapped");
                $(selector + " li a").css({
                    "color": "#000",
                    "text-shadow": "0px 1px 0px white"
                });
            } else {
                return 0;
            }
        }

        /***************** @end *****************/

        /***************** AJAX *****************/

        function jqpadAjax(options) {
            $("a").live("click",
            function() {
                var infectedLocation,
                cleanLocation,
                perfromDataCall,
                dataCall,
                toolbarTitle,
                ahrefLocation,
                thisClass;
                //Vars
                thisClass = $(this).attr("class");
                infectedLocation = $(this).attr("href");
                locationWithoutHash = infectedLocation.replace("#", "");
                cleanLocation = "content/" + locationWithoutHash;
                dataCall = $(this).attr("data-call");
                checkForActivePanel = $(".panel-active").length;
                if ($(this).attr("data-target")) {
                    dataTarget = $(this).attr("data-target");
                    dataTargetType = dataTarget.split("-")[0];
                    dataTargetLocation = dataTarget.split("-")[1];
                } else {
                    dataTargetType = null;
                }

                toolbarTitle = $(this).attr("title");
                if (!toolbarTitle) {
                    toolbarTitle = settings.siteName;
                }
                if (dataCall !== "") {
                    performDataCall = true;
                } else {
                    performDataCall = false;
                }
                ahrefLocation = $(this).closest(".content-right").length;

                //show loading
                if (infectedLocation !== "#share") {
                    setTimeout(function() {
                        if (dataTargetType) {
                            switch (dataTargetType) {
                                //Check if other features are being called instead
                                //Used switch for when other features are being added.
                            case "panel":
                                panels(dataTargetLocation);
                                break;
                            }
                        } else {

                            //Slide the content
                            if (thisClass === "backbutton") {
                                $('.content-right .content-main').children().animate({
                                    marginLeft: 500
                                },
                                200,
                                function() {
                                    $(this).empty();
                                });
                            } else {
                                $('.content-right .content-main').children().animate({
                                    marginLeft: -500
                                },
                                200,
                                function() {
                                    $(this).empty();
                                });
                            }

                            //Fix loading display bug
                            if ($(this, ".nav")) {
                                setTimeout(function() {
                                    displayLoading(true);
                                },
                                200);
                            } else {
                                displayLoading(true);
                            }
                            if (ahrefLocation === 0) {
                                if (options.defaultNavMethod === true) {
                                    /** AJAX! D: **/
                                    if (performDataCall === true) {
                                        $.ajax({
                                            cache: options.cache,
                                            url: cleanLocation,
                                            data: dataCall,
                                            type: 'POST',
                                            success: function(data) {
                                                setTimeout(function() {
                                                    displayLoading(false);
                                                    $(".content-right .content-main").html(data);
                                                    functionsAfterLoading(toolbarTitle);
                                                },
                                                300);
                                            }
                                        });
                                    } else {
                                        $.ajax({
                                            cache: options.cache,
                                            url: cleanLocation,
                                            success: function(data) {
                                                setTimeout(function() {
                                                    displayLoading(false);
                                                    $(".content-right .content-main").html(data);
                                                    functionsAfterLoading(toolbarTitle);
                                                },
                                                300);
                                            }
                                        });
                                    }
                                }
                            } else {
                                if (options.defaultNavMethod === true) {
                                    //Duplicated above for animations when called in right panel. No animations Yet.
                                    if (performDataCall === true) {
                                        $.ajax({
                                            cache: options.cache,
                                            url: cleanLocation,
                                            data: dataCall,
                                            type: 'POST',
                                            success: function(data) {
                                                setTimeout(function() {
                                                    displayLoading(false);
                                                    $(".content-right .content-main").html(data);
                                                    functionsAfterLoading(toolbarTitle);
                                                },
                                                300);
                                            }
                                        });
                                    } else {
                                        $.ajax({
                                            cache: options.cache,
                                            url: cleanLocation,
                                            success: function(data) {
                                                setTimeout(function() {
                                                    displayLoading(false);
                                                    $(".content-right .content-main").html(data);
                                                    functionsAfterLoading(toolbarTitle);
                                                },
                                                300);
                                            }
                                        });
                                    }
                                }
                            }
                        }
                        //SetTimeout end	
                    },
                    200);
                } else {
                    /* Social Intergration */
                    if ($("body").find(".bubble-share").length === 0) {
                        $(this).after('<div class="share-bubble-wrapper"><div class="bubble-share"><div class="top-arrow"></div><li><script src="http://widgets.digg.com/buttons.js" type="text/javascript"></script><a class="DiggThisButton DiggMedium"></a></li><li><a href="http://twitter.com/share" class="twitter-share-button" data-count="vertical">Tweet</a></li><script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script><li><a name="fb_share" type="box_count" href="http://www.facebook.com/sharer.php">Share</a></li><script src="http://static.ak.fbcdn.net/connect.php/js/FB.Share" type="text/javascript"></script></div></div>');
                        var pos = $(this).position();
                        var elemWidth = $(this).width();
                        var elemHeight = $(this).height();
                        var posX = pos.left + (elemWidth / 2);
                        var posY = pos.top + elemHeight + 16;
                        $(".share-bubble-wrapper").css({
                            top: posY,
                            left: posX
                        });
                        $(".share-bubble-wrapper").animate({
                            marginTop: 0,
                            opacity: 1
                        },
                        200);
                        $("*:not(.share-bubble-wrapper)").live("touchmove touchstart",
                        function() {
                            closeShareBubble();
                        });
                    } else {
                        closeShareBubble();
                    }
                }
            });
        }

        // function loadDefaultPage() {
        //            $.ajax({
        //                url: settings.defaultPage,
        //                success: function(data) {
        //                    $(".content-right .content-main").html(data);
        //                    Title = settings.siteName;
        //                    functionsAfterLoading(Title);
        //                }
        //            });
        //        }

        function getScripts(arr) {
            for (var i = 0; i < arr.length; i++) {
                $.getScript(arr[i],
                function() {
                    console.log("Scripts loaded.");
                });
            }
        }

        // function displayLoading(bool) {
        //          if (bool === true) {
        //              $(".loading").css({
        //                  "display": "block"
        //              });
        //          }
        //          if (bool === false) {
        //              $(".loading").css({
        //                  "display": "none"
        //              });
        //          }
        //      }

        function functionsAfterLoading(toolbarTitle) {
            changeTitlePanelRight(toolbarTitle);
            numberLists();
            console.log("Request perform successfully");
            hidePanels();
            clearForm();
            closePanel();
            backButton();
            appendSpaceAfterContent();
            deletable();
        }

        function backButton() {
            var location = window.location.hash;
            location = location.replace("#", "");
            location = location.replace(/([^\/]+\/)$/, '.$1')
            location = location.split(".");

            var lengthLocation = window.location.hash;
            lengthLocation = lengthLocation.replace("#", "");
            lengthLocation = lengthLocation.split("/");
            lengthLocation = lengthLocation.length;

            function showBackButton(bool, urlLocation) {
                if (bool === true) {
                    $("<a href='#" + urlLocation[0] + "' class='backbutton'>Back</a>").prependTo(".content-right .toolbar");
                } else {
                    return 0;
                }
            }

            //When the location is greater than 3, means back button is needed.
            if (lengthLocation > 2) showBackButton(true, location);
            if (lengthLocation <= 2) showBackButton(false, location);

        }

        /***************** @END *****************/

        /***************** Graphics *****************/

        // siteGraphics();
        //         function siteGraphics() {
        //             var splashscreen = settings.splash,
        //             icon = settings.icon;
        //             $("head").append("");
        //             $("head").append("");
        //             $("head").append("");
        // 
        //         }
        /***************** @END *****************/

        /***************** Titles Changes *****************/

        // function changeTitlePanelRight(title) {
        //             var toolbarTitle = ".content-right .toolbar";
        //             $(toolbarTitle).empty();
        //             $(toolbarTitle).html("<h1>" + title + "</h1>");
        //         }

        // function changeNavPanelTitle() {
        //             var toolbarTitle = ".content-left .toolbar h1";
        //             $(toolbarTitle).empty();
        //             $(toolbarTitle).text(settings.siteName);
        //         }

        // function changeTitlesToDefault() {
        //             var toolbarTitle = ".content-right .toolbar h1";
        //             if (settings.defaultHomeTitle) {
        //                 $(toolbarTitle).empty();
        //                 $(toolbarTitle).text(settings.defaultHomeTitle);
        //             } else {
        //                 $(toolbarTitle).empty();
        //                 $(toolbarTitle).text(settings.defaultHomeTitle);
        //             }
        //         }
        /***************** @END *****************/

        /***************** Misc *****************/

        // function appendSpaceAfterContent() {
        //             //To address scrolling bug
        //             $(".content-right .content-main").append("<div class='space'></div>");
        //         }

        // function scrollable() {
        //             $(document).bind('touchmove',
        //             function(event) {
        //                 event.preventDefault();
        //             });
        //             Leftscroll = new iScroll('scrollableleft');
        //             Rightcroll = new iScroll('scrollableright');
        //         }

        function linksInLists() {
            $(".list a").live("click",
            function() {
                //NEED TO SOLVE THIS.
                $(this).parent().parent().addClass("highlight");
            });
        }

        function clearForm() {
            $("input").live("click",
            function() {
                $(this).val("").addClass("inputactive");
            });
        }

        function clickTitle() {
            $(".content-left .toolbar h1").click(function() {
                loadDefaultPage();
            });
            if ($(".tapped", ".nav")) $(".nav").find(".tapped").removeClass("tapped");
        }

        /***************** @END *****************/

        /***************** Features *****************/


        /* Social Scripts, Digg button, tweet, etc. */
        // function closeShareBubble() {
        //     $("body").find(".bubble-share").animate({
        //         opacity: "0"
        //     },
        //     150,
        //     function() {
        //         $(this).remove();
        //         window.location.hash = "";
        //     });
        // }
        // var s = document.createElement('SCRIPT'),
        // s1 = document.getElementsByTagName('SCRIPT')[0];
        // s.type = 'text/javascript';
        // s.async = true;
        // s.src = 'http://widgets.digg.com/buttons.js';
        // s1.parentNode.insertBefore(s, s1);
        // /* @END */
        // 
        // function numberLists() {
        //     $.fn.numbered = function() {
        //         alert("called");
        //         this.each(function() {
        //             $(this).attr("id", "numbered");
        //         });
        //     }
        // 
        //     var listLength = $("#numbered li").length,
        //     i;
        //     for (i = 0; i < listLength; i++) {
        //         $("#numbered li:eq(" + i + ")").prepend("<span class='listnumber'>" + (i + 1) + "</span>");
        //     }
        }

        // function hidePanels() {
        //             var panelsIds = $(".panel").map(function() {
        //                 return this.id;
        //             }).get().join(',');
        // 
        //             var array = panelsIds.split(',');
        // 
        //             $.each(array,
        //             function() {
        //                 $("#" + this).css({
        //                     "display": "none"
        //                 });
        //                 $("#" + this).children().css({
        //                     "display": "none",
        //                     "opacity": "0"
        //                 });
        //             });
        //         }

        // function panels(id) {
        //             var checkIfcloseButton = $(".close").length;
        //             if (!checkIfcloseButton) $("<span class='close'>Close</span>").click(closePanel).prependTo("#" + id);
        //             $("#" + id).slideDown(300,
        //             function() {
        //                 $(this).children().delay(300).css({
        //                     "display": "block"
        //                 }).animate({
        //                     opacity: 1
        //                 },
        //                 300);
        //             }).addClass("panel-active");
        //         }

        // function closePanel() {
        //           $(this).parent().slideUp(200);
        //       }
      

        function deletable() {
            $.fn.deletable = function(callback) {
                this.each(function() {
                    $(this).attr("id", "deletable");
                });

                var clbk = callback;


                function deleteMe() {
                    $(this).parent().hide(200,
                    function() {
                        $.proxy(clbk, this)();
                        $(this).remove;
                    });
                }

                $("#deletable li").live("touchmove",
                function() {
                    if ($(this).attr("id") !== "non-delete") {
                        if ($(this).parent().find(".deletebutton-active").length < 1) {
                            //Check is delete button is there
                            if ($(this).find(".deletebutton").length < 1) $("<span class='deletebutton'></span>").click(deleteMe).appendTo(this);
                            //Slide it out
                            $(".deletebutton").animate({
                                marginRight: 10
                            },
                            300,
                            function() {
                                $(this).addClass("deletebutton-active");

                            });
                        } else {
                            $(this).parent().find(".deletebutton-active").animate({
                                marginRight: -80
                            },
                            200,
                            function() {
                                $(this).remove();
                            });
                        }
                    } else {
                        return 0;
                    }
                });
            }
        }
        /***************** @END *****************/

    }
})(jQuery);

