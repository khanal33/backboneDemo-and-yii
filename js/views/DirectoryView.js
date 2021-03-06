define(['jquery', 'backbone', 'js/collection/contacts', 'js/views/contactView', 'js/Helper/imageupload_helper', 'js/model/contact','alertify'],
    function($, Backbone, Contacts, Contactview, imagehelper1, contactmodel, Alertify) {

        var ImageUploadHelper = requirejs('js/Helper/imageupload_helper');
        var DirectoryView = Backbone.View.extend({
            el: $("#contacts"),//set html content
            imgUrl: '',
            // contacts: [],
            initialize: function() {
                // debugger;
                var me = this;
                var contactCollection = new Contacts();
                contactCollection.fetch().then(function(collection) {
                    me.collection = contactCollection;
                    me.contacts = collection;
                    me.$el.find("#filter").append(me.createSelect());
                    me.on("change:filterType", me.filterByType, me);//on is model event and bind on anoter view
                    me.collection.on("reset", me.render, me); //binding this gives error while unbinding
                    me.collection.on("add", me.renderContact, me);
                    me.collection.on("remove", me.removeContact, me);
                    me.render();
                });


            },

            events: {
                "change #filter select": "setFilter",
                "click #add": "addContact",
                "click #showForm": "showForm",
                "click #submit" : "userlogin",
                'keyup #password' : "enterPassword"
                //"blur #name": "validateName",
                //"blur #password": "enterPassword"
                //"keydown #tel": "validateTelephone",
                //"blur #email": "validateEmail"
            },
             enterPassword:function(e){
                console.log('Enter');
                 if(e.keyCode == 13){
                    this.$el.find('#submit').trigger('click');
                 }
         },
            userlogin: function(e){
                debugger;
                e.preventDefault();
                var me=this,
                    username = me.$el.find("#username").val(),
                    password = me.$el.find("#password").val();

                $.post(base_url+'/index.php/Contact/getlogin',{username:username,password:password},function(data){
                    if(data._success == true) {
                      Alertify.alert("testing for login");
                    } else {
                        Alertify.alert("login failed");
                    }
                },"json");
                            
            },
            validateName: function(e) {
                // debugger;
                var item = $(e.target);
                var me = this;
                if ((_.isEmpty(item.val()) == true) || ((item.val()).toString().length) <= 5) {
                    item.addClass("error");
                    me.$el.find('#add').attr('disabled', 'disabled');
                } else {
                    item.removeClass("error");
                    me.$el.find('#add').removeAttr('disabled');
                }
                //     item.css('border-color', 'no');


            },
            validateAddress: function(e) {
                // debugger;
                var item = $(e.target);
                var me = this;
                if (_.isEmpty(item.val()) == true) {
                    item.addClass("error");
                    me.$el.find('#add').attr('disabled', 'disabled');
                } else {
                    item.removeClass("error");
                    me.$el.find('#add').removeAttr('disabled');
                }
            },
            validateTelephone: function(event) {
                //debugger;
                if (event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 46) {} else {
                    if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
                        event.preventDefault();
                    }
                }

            },
            validateEmail: function(e) {
                // debugger
                var item = $(e.target);
                var me = this;
                var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
                // return pattern.test(emailAddress);

                if (pattern.test(item.val()) == false) {
                    item.addClass("error");
                    me.$el.find('#add').attr('disabled', 'disabled');
                } else {
                    item.removeClass("error");
                    me.$el.find('#add').removeAttr('disabled');
                }

            },

            setFilter: function(e) {
                this.filterType = e.currentTarget.value;

                this.trigger("change:filterType");
            },
            showForm: function() {

                this.$el.find("#addContact").slideToggle();
            },

            removeContact: function(removedModel) {

                var removed = removedModel.attributes;

                if (removed.photo === "/img/placeholder.png") {
                    delete removed.photo;
                }

                _.each(contacts, function(contact) {
                    if (_.isEqual(contact, removed)) {
                        contacts.splice(_.indexOf(contacts, contact), 1);
                    }
                });
            },

            filterByType: function() {
                if (this.filterType === "All") {
                    this.collection.reset(this.contacts);

                    contactsRouter.navigate("filter/all");

                } else {
                    this.collection.reset(this.contacts, {
                        silent: true
                    });

                    var filterType = this.filterType,
                        filtered = _.filter(this.collection.models, function(item) {
                            return  item.get("type_name") === filterType;
                        });

                    this.collection.reset(filtered);
                    contactsRouter.navigate("filter/" + filterType);
                }
            },
            addContact: function(e) {
           // debugger;
                var validator = $( "#addContact" ).validate();
                  validator.form();
                e.preventDefault();

                var me = this;
                var validate = {
                    rules: {
                        field: {
                          required: true,
                          email: true,
                          number : true
                        }
                    }
                };

                // this.model.save(validate);
                //e.preventDefault();
                // var me = this;
                me.imgUrl = me.imageUpload.getImageUrl();
                var newModel = {};
                $("#addContact").find("input").each(function(i, el) {
                    if ($(el).val() !== "") {
                        if (el.id === "photo") {
                            newModel[el.id] = me.imgUrl;
                            el.parentNode.replaceChild(el.cloneNode(true), el);
                        } else {
                            newModel[el.id] = $(el).val();
                            $(el).val('');
                        };
                    }
                });

                newModel['type'] = Number(me.$el.find('#select_type').val());
                newModel['type_name'] = me.$el.find('#select_type option:selected').text();
                var formData = newModel;
                this.contacts.push(formData);
                $.ajax({
                    type: "POST",
                    data: {
                        'postData': formData
                    },
                    url: base_url + '/index.php/Contact/addContactList'
                });
                if (_.indexOf(this.getTypes(), formData.type) === -1) {
                    var formModel = new this.collection.model();  //model validate
                    formModel.set(formData,{silent : false}); //model validate
                    me.collection.add(formModel);
                    this.$el.find("#filter").find("select").remove().end().append(this.createSelect());


                } else {
                    this.collection.add(new Contactview(formData));
                }

            },

            render: function() {
                //debugger;
                var that = this;
                this.$el.find('#addContact').hide();
                this.$el.find('#familyList').html('');
                this.$el.find('#imageupload-container').html('');

                _.each(this.collection.models, function(item) {
                    that.renderContact(item);
                }, this);
                this.imageUpload = new ImageUploadHelper({
                    renderTo: $('#imageupload-container')
                }).render();
                

            },

            renderContact: function(item) {
                var contactView = new Contactview({
                    model: item
                });
                this.$el.find('#familyList').append(contactView.render().el);
                
            },
            getTypes: function() {
                return _.uniq(this.collection.pluck("type_name"), false, function(type) {
                    return type.toLowerCase();
                });
            },

            createSelect: function() {
                var filter = this.$el.find("#filter"),
                    select = $("<select/>", {
                        html: "<option >All</option>"
                    });

                _.each(this.getTypes(), function(item) {
                    var option = $("<option/>", {
                        value: item,
                        text: item
                    }).appendTo(select);
                });
                return select;
            }
        });
        return DirectoryView;
    });