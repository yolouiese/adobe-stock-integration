<?php
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
namespace Magento\AdobeStockImageAdminUi\Ui\Component\Listing\Columns\PremiumPrice;

/**
 * Pricing filter options provider
 */
class Options implements \Magento\Framework\Data\OptionSourceInterface
{
    /**
     * Get options
     *
     * @return array
     */
    public function toOptionArray()
    {
        return [
            [
                'label' => __('All'),
                'value' => 'ALL'
            ],
            [
                'label' => __('Standard'),
                'value' => 'FALSE'
            ],
            [
                'label' => __('Premium'),
                'value' => 'TRUE'
            ]
        ];
    }
}
