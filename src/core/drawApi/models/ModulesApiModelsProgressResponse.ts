/* tslint:disable */
/* eslint-disable */
/**
 * sdapiv1
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
/**
 * ProgressResponse
 * @export
 * @interface ModulesApiModelsProgressResponse
 */
export interface ModulesApiModelsProgressResponse {
    /**
     * Progress，The progress with a range of 0 to 1
     * @type {number}
     * @memberof ModulesApiModelsProgressResponse
     */
    progress: number;
    /**
     * ETA in secs
     * @type {number}
     * @memberof ModulesApiModelsProgressResponse
     */
    etaRelative: number;
    /**
     * State，The current state snapshot
     * @type {object}
     * @memberof ModulesApiModelsProgressResponse
     */
    state: object;
    /**
     * Current image，The current image in base64 format. opts.show_progress_every_n_steps is required for this to work.
     * @type {string}
     * @memberof ModulesApiModelsProgressResponse
     */
    currentImage?: string;
    /**
     * Info text，Info text used by WebUI.
     * @type {string}
     * @memberof ModulesApiModelsProgressResponse
     */
    textinfo?: string;
}

export function ModulesApiModelsProgressResponseFromJSON(json: any): ModulesApiModelsProgressResponse {
    return ModulesApiModelsProgressResponseFromJSONTyped(json, false);
}

export function ModulesApiModelsProgressResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): ModulesApiModelsProgressResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'progress': json['progress'],
        'etaRelative': json['eta_relative'],
        'state': json['state'],
        'currentImage': !exists(json, 'current_image') ? undefined : json['current_image'],
        'textinfo': !exists(json, 'textinfo') ? undefined : json['textinfo'],
    };
}

export function ModulesApiModelsProgressResponseToJSON(value?: ModulesApiModelsProgressResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'progress': value.progress,
        'eta_relative': value.etaRelative,
        'state': value.state,
        'current_image': value.currentImage,
        'textinfo': value.textinfo,
    };
}

