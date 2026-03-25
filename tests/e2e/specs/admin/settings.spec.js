/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

/**
 * Internal dependencies
 */
const {
	clearConnectors,
	disableExperiments,
	enableExperiments,
	visitConnectorsPage,
	visitSettingsPage,
} = require( '../../utils/helpers' );

test.describe( 'Plugin settings', () => {
	test.beforeAll( async ( { requestUtils } ) => {
		await requestUtils.deactivatePlugin( 'e2e-test-request-mocking' );
	} );

	test( 'Can visit the settings page and see error message', async ( {
		admin,
		page,
		requestUtils,
	} ) => {
		// Activate the request mocking plugin.
		await requestUtils.activatePlugin( 'e2e-test-request-mocking' );

		// Clear out any existing Connectors.
		await clearConnectors( admin, page );

		// Visit the settings page.
		await visitSettingsPage( admin );

		// Ensure the page title is correct.
		await expect(
			page.getByText(
				'Configure AI features and experiments for your WordPress site.'
			)
		).toBeVisible();

		// Ensure the no AI Connectors error message is displayed.
		await expect(
			page.getByText(
				'The AI plugin requires a valid AI Connector to function properly'
			)
		).toBeVisible();
	} );

	test( 'Can visit the Connectors page and add a valid OpenAI Connector', async ( {
		admin,
		page,
		requestUtils,
	} ) => {
		// Activate the request mocking plugin.
		await requestUtils.activatePlugin( 'e2e-test-request-mocking' );

		await visitConnectorsPage( admin );

		// Add dummy credentials for OpenAI.
		await page
			.locator( '.connector-item--ai-provider-for-openai button' )
			.click();
		await page
			.locator(
				'.connector-item--ai-provider-for-openai input[type="text"]'
			)
			.fill( 'valid-api-key' );

		// Save the credentials.
		await page
			.locator(
				'.connector-item--ai-provider-for-openai .connector-settings button'
			)
			.click();
	} );

	test( 'Can turn on Experiments', async ( { admin, page } ) => {
		// Globally disable experiments.
		await disableExperiments( admin, page );

		// Ensure global AI setting is disabled.
		await expect(
			page.getByRole( 'checkbox', { name: 'Enable AI' } )
		).not.toBeChecked();

		// Ensure feature checkboxes are disabled when AI is disabled.
		await expect(
			page.locator( 'input[id^="wpai_feature_"]' ).first()
		).toBeDisabled();

		// Globally turn on experiments.
		await enableExperiments( admin, page );

		// Ensure global AI setting is enabled.
		await expect(
			page.getByRole( 'checkbox', { name: 'Enable AI' } )
		).toBeChecked();

		// Ensure we see the editor experiments section.
		await expect( page.getByText( 'Editor Experiments' ) ).toBeVisible();

		// Ensure we see the admin experiments section.
		await expect( page.getByText( 'Admin Experiments' ) ).toBeVisible();
	} );
} );
