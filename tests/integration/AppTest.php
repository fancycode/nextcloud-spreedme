<?php
/**
 * Nextcloud - spreedme
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Leon <leon@struktur.de>
 * @copyright struktur AG 2016
 */

use OCP\AppFramework\App;
use Test\TestCase;

/**
 * This test shows how to make a small Integration Test. Query your class
 * directly from the container, only pass in mocks if needed and run your tests
 * against the database
 */
class AppTest extends TestCase {

	private $container;

	public function setUp() {
		parent::setUp();
		$app = new App('spreedme');
		$this->container = $app->getContainer();
	}

	public function testAppInstalled() {
		$appManager = $this->container->query('OCP\App\IAppManager');
		$this->assertTrue($appManager->isInstalled('spreedme'));
	}

}