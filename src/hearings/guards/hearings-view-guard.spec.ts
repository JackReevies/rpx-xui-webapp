import { Router } from '@angular/router';
import { FeatureToggleService } from '@hmcts/rpx-xui-common-lib';
import { Store } from '@ngrx/store';
import { cold } from 'jasmine-marbles';
import { of } from 'rxjs';
import { UserDetails } from '../../app/models';
import { SessionStorageService } from '../../app/services';
import * as fromAppStore from '../../app/store';
import { HearingsViewGuard } from './hearings-view-guard';

describe('HearingsViewGuard', () => {
  const USER_1: UserDetails = {
    canShareCases: true,
    sessionTimeout: {
      idleModalDisplayTime: 10,
      totalIdleTime: 50
    },
    userInfo: {
      id: '41a90c39-d756-4eba-8e85-5b5bf56b31f5',
      forename: 'Luke',
      surname: 'Wilson',
      email: 'lukesuperuserxui@mailnesia.com',
      active: true,
      roles: [
        'caseworker',
        'caseworker-sscs',
        'hearing-manager'
      ]
    }
  };

  const USER_2: UserDetails = {
    canShareCases: true,
    sessionTimeout: {
      idleModalDisplayTime: 10,
      totalIdleTime: 50
    },
    userInfo: {
      id: '41a90c39-d756-4eba-8e85-5b5bf56b31f5',
      forename: 'Luke',
      surname: 'Wilson',
      email: 'lukesuperuserxui@mailnesia.com',
      active: true,
      roles: [
        'caseworker',
        'caseworker-sscs',
        'hearing-viewer'
      ]
    }
  };

  const USER_3: UserDetails = {
    canShareCases: true,
    sessionTimeout: {
      idleModalDisplayTime: 10,
      totalIdleTime: 50
    },
    userInfo: {
      id: '41a90c39-d756-4eba-8e85-5b5bf56b31f5',
      forename: 'Luke',
      surname: 'Wilson',
      email: 'lukesuperuserxui@mailnesia.com',
      active: true,
      roles: [
        'caseworker',
        'caseworker-sscs',
        'listed-hearing-viewer'
      ]
    }
  };
  const FEATURE_FLAG = [
    {
      jurisdiction: 'SSCS',
      caseType: 'Benefit',
      roles: [
        'caseworker-sscs',
        'caseworker-sscs-judge',
        'caseworker-sscs-dwpresponsewriter'
      ]
    }
  ];

  const CASE_INFO = { cid: '1546518523959179', caseType: 'Benefit', jurisdiction: 'SSCS' };

  let hearingsViewGuard: HearingsViewGuard;
  let routerMock: jasmine.SpyObj<Router>;
  let storeMock: jasmine.SpyObj<Store<fromAppStore.State>>;
  let sessionStorageMock: jasmine.SpyObj<SessionStorageService>;
  let featureToggleMock: jasmine.SpyObj<FeatureToggleService>;

  beforeEach(() => {
    routerMock = jasmine.createSpyObj<Router>('router', ['navigate']);
    storeMock = jasmine.createSpyObj<Store<fromAppStore.State>>('store', ['pipe']);
    sessionStorageMock = jasmine.createSpyObj<SessionStorageService>('sessionStorageService', ['getItem']);
    featureToggleMock = jasmine.createSpyObj<FeatureToggleService>('featureToggleService', ['getValueOnce']);
  });

  it('case worker should be able to access the hearings view link', () => {
    storeMock.pipe.and.returnValue(of(USER_1));
    featureToggleMock.getValueOnce.and.returnValue(of(FEATURE_FLAG));
    sessionStorageMock.getItem.and.returnValue(JSON.stringify(CASE_INFO));
    hearingsViewGuard = new HearingsViewGuard(storeMock, sessionStorageMock, featureToggleMock, routerMock);
    const result$ = hearingsViewGuard.canActivate();
    const canActive = true;
    const expected = cold('(b|)', { b: canActive });
    expect(result$).toBeObservable(expected);
  });

  it('judicial user should be able to access the hearings view link', () => {
    storeMock.pipe.and.returnValue(of(USER_2));
    featureToggleMock.getValueOnce.and.returnValue(of(FEATURE_FLAG));
    sessionStorageMock.getItem.and.returnValue(JSON.stringify(CASE_INFO));
    hearingsViewGuard = new HearingsViewGuard(storeMock, sessionStorageMock, featureToggleMock, routerMock);
    const result$ = hearingsViewGuard.canActivate();
    const canActive = true;
    const expected = cold('(b|)', { b: canActive });
    expect(result$).toBeObservable(expected);
  });

  it('ogd user should be able to access the hearings view link', () => {
    storeMock.pipe.and.returnValue(of(USER_3));
    featureToggleMock.getValueOnce.and.returnValue(of(FEATURE_FLAG));
    sessionStorageMock.getItem.and.returnValue(JSON.stringify(CASE_INFO));
    hearingsViewGuard = new HearingsViewGuard(storeMock, sessionStorageMock, featureToggleMock, routerMock);
    const result$ = hearingsViewGuard.canActivate();
    const canActive = true;
    const expected = cold('(b|)', { b: canActive });
    expect(result$).toBeObservable(expected);
  });

  it('user should not be able to access the hearings view link', () => {
    storeMock.pipe.and.returnValue(of(USER_1));

    featureToggleMock.getValueOnce.and.returnValue(of(FEATURE_FLAG));
    const caseInfo = { cid: '1546518523959179', caseType: 'PRLAPPS', jurisdiction: 'PRL' };
    sessionStorageMock.getItem.and.returnValue(JSON.stringify(caseInfo));
    hearingsViewGuard = new HearingsViewGuard(storeMock, sessionStorageMock, featureToggleMock, routerMock);
    const result$ = hearingsViewGuard.canActivate();
    const canActive = false;
    const expected = cold('(b|)', { b: canActive });
    expect(result$).toBeObservable(expected);
  });
});
