/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

define([
    'uiComponent',
    'jquery',
    'underscore',
    'Magento_Ui/js/lib/validation/validator',
    'mage/translate',
    'jquery/file-uploader'
], function (Component, $, _, validator) {
    'use strict';

    return Component.extend({
        defaults: {
            imageUploadInputSelector: '#image-uploader-form',
            directoriesPath: 'media_gallery_listing.media_gallery_listing.media_gallery_directories',
            actionsPath: 'media_gallery_listing.media_gallery_listing.media_gallery_columns.thumbnail_url',
            messagesPath: 'media_gallery_listing.media_gallery_listing.messages',
            imageUploadUrl: '',
            acceptFileTypes: '',
            allowedExtensions: '',
            maxFileSize: '',
            maxFileNameLength: 90,
            loader: false,
            modules: {
                directories: '${ $.directoriesPath }',
                actions: '${ $.actionsPath }',
                mediaGridMessages: '${ $.messagesPath }',
                sortBy: '${ $.sortByName }',
                listingPaging: '${ $.listingPagingName }'
            }
        },

        /**
         * Init component
         *
         * @return {exports}
         */
        initialize: function () {
            this._super().observe(
                [
                    'loader',
                    'count'
                ]
            );

            return this;
        },

        /**
         * Initializes file upload library
         */
        initializeFileUpload: function () {
            $(this.imageUploadInputSelector).fileupload({
                url: this.imageUploadUrl,
                acceptFileTypes: this.acceptFileTypes,
                allowedExtensions: this.allowedExtensions,
                maxFileSize: this.maxFileSize,

                /**
                 * Extending the form data
                 *
                 * @param {Object} form
                 * @returns {Array}
                 */
                formData: function (form) {
                    return form.serializeArray().concat(
                        [{
                            name: 'isAjax',
                            value: true
                        },
                        {
                            name: 'form_key',
                            value: window.FORM_KEY
                        },
                        {
                            name: 'target_folder',
                            value: this.getTargetFolder()
                        }]
                    );
                }.bind(this),

                add: function (e, data) {
                    if (!this.isSizeExceeded(data.files[0]).passed) {
                        this.addValidationErrorMessage('Cannot upload "' + data.files[0].name +
                                      '". File exceeds maximum file size limit.');

                        return;
                    } else if (!this.isFileNameLengthExceeded(data.files[0]).passed) {
                        this.addValidationErrorMessage('Cannot upload "' + data.files[0].name +
                                                       '". Filename is too long, must be 90 chracters or less.');

                        return;
                    }

                    this.showLoader();
                    this.count(1);
                    data.submit();
                }.bind(this),

                stop: function () {
                    this.openNewestImages();
                    this.mediaGridMessages().scheduleCleanup();
                }.bind(this),

                start: function () {
                    this.mediaGridMessages().clear();
                }.bind(this),

                done: function (e, data) {
                    var response = data.jqXHR.responseJSON;

                    if (!response.success) {
                        this.showErrorMessage(data);

                        return;
                    }
                    this.showSuccessMessage(data);
                    this.hideLoader();
                    this.actions().reloadGrid();
                }.bind(this)
            });
        },

        /**
         * Add error message after validation error.
         *
         * @param {String} message
         */
        addValidationErrorMessage: function (message) {
            this.mediaGridMessages().add(
                'error',
                $.mage.__(message)
            );

            this.count() < 2 || this.mediaGridMessages().scheduleCleanup();
        },

        /**
         * Checks if size of provided file exceeds
         * defined in configuration size limits.
         *
         * @param {Object} file - File to be checked.
         * @returns {Boolean}
         */
        isSizeExceeded: function (file) {
            return validator('validate-max-size', file.size, this.maxFileSize);
        },

        /**
         * Checks if name length of provided file exceeds
         * defined in configuration size limits.
         *
         * @param {Object} file - File to be checked.
         * @returns {Boolean}
         */
        isFileNameLengthExceeded: function (file) {
            return validator('max_text_length', file.name, this.maxFileNameLength);
        },

        /**
         * Go to recently uploaded images if at least one uploaded successfully
         */
        openNewestImages: function () {
            this.mediaGridMessages().get().each(function (message) {
                if (message.code === 'success') {
                    this.actions().deselectImage();
                    this.sortBy().selectDefaultOption();
                    this.listingPaging().goFirst();

                    return false;
                }
            }.bind(this));
        },

        /**
         * Show error meassages with file name.
         *
         * @param {Object} data
         */
        showErrorMessage: function (data) {
            data.files.each(function (file) {
                this.mediaGridMessages().add(
                    'error',
                    $.mage.__('Cannot upload "' + file.name + '". This file format is not supported.')
                );
            }.bind(this));

            this.hideLoader();
        },

        /**
         * Show success message, and files counts
         */
        showSuccessMessage: function () {
            var prefix = this.count() === 1 ? 'an image' : this.count() + ' images';

            this.mediaGridMessages().messages.remove(function (item) {
                return item.code === 'success';
            });
            this.mediaGridMessages().add('success', $.mage.__('Successfully uploaded ' + prefix));
            this.count(this.count() + 1);

        },

        /**
         * Gets Media Gallery selected folder
         *
         * @returns {String}
         */
        getTargetFolder: function () {

            if (_.isUndefined(this.directories().activeNode()) ||
                _.isNull(this.directories().activeNode())) {
                return '/';
            }

            return this.directories().activeNode();
        },

        /**
         * Shows spinner loader
         */
        showLoader: function () {
            this.loader(true);
        },

        /**
         * Hides spinner loader
         */
        hideLoader: function () {
            this.loader(false);
        }
    });
});
