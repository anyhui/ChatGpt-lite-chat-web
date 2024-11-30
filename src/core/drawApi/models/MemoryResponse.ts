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
 * MemoryResponse
 * @export
 * @interface MemoryResponse
 */
export interface MemoryResponse {
    /**
     * RAM，System memory stats
     * @type {object}
     * @memberof MemoryResponse
     */
    ram: object;
    /**
     * CUDA，nVidia CUDA memory stats
     * @type {object}
     * @memberof MemoryResponse
     */
    cuda: object;
}

export function MemoryResponseFromJSON(json: any): MemoryResponse {
    return MemoryResponseFromJSONTyped(json, false);
}

export function MemoryResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): MemoryResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'ram': json['ram'],
        'cuda': json['cuda'],
    };
}

export function MemoryResponseToJSON(value?: MemoryResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'ram': value.ram,
        'cuda': value.cuda,
    };
}

