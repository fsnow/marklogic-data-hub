import React from 'react';
import { Router } from 'react-router';
import { createMemoryHistory } from 'history';
const history = createMemoryHistory();
import { render, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'
import axiosMock from 'axios';
import Flows from './flows';
import data from '../../assets/mock-data/flows.data';

jest.mock('axios');

describe('Flows component', () => {

    let flowsProps = {
        flows: data.flows.data,
        steps: data.steps.data,
        deleteFlow: () => null,
        createFlow: () => null,
        updateFlow: () => null,
        deleteStep: () => null,
        runStep: () => null,
        running: [],
        uploadError: '',
        newStepToFlowOptions: () => null,
        addStepToFlow: () => null,
        flowsDefaultActiveKey: [],
        showStepRunResponse: () => null,
        runEnded: {},
    }

    beforeEach(() => {
        axiosMock.get['mockImplementationOnce'](jest.fn(() => Promise.resolve({})));
    });

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    it('user with flow read, write, and operator privileges can view, edit, and run', () => {
        const {getByText, getByLabelText} = render(
            <Router history={history}><Flows 
                {...flowsProps}
                canReadFlow={true}
                canWriteFlow={true}
                hasOperatorRole={true}
            /></Router>
        );

        let flowButton = getByLabelText('icon: right');
        expect(getByText("testFlow")).toBeInTheDocument();
        expect(getByLabelText('create-flow')).toBeInTheDocument();
        expect(getByLabelText('deleteFlow-0')).toBeInTheDocument();

        // Open flow
        fireEvent.click(flowButton);
        expect(getByText("Mapping1")).toBeInTheDocument();
        expect(getByLabelText('runStep-2')).toBeInTheDocument();
        expect(getByLabelText('deleteStep-testFlow-2')).toBeInTheDocument();

        // Open Add Step
        let addStep = getByText('Add Step');
        fireEvent.click(addStep);
        expect(getByText("Step 1")).toBeInTheDocument();

    });

    it('user without flow write privileges cannot edit', () => {
        const {getByText, getByLabelText, queryByLabelText} = render(
            <Router history={history}><Flows 
                {...flowsProps}
                canReadFlow={true}
                canWriteFlow={false}
                hasOperatorRole={true}
            /></Router>
        );

        let flowButton = getByLabelText('icon: right');
        expect(getByText("testFlow")).toBeInTheDocument();
        expect(getByLabelText('create-flow-disabled')).toBeInTheDocument();
        expect(getByLabelText('deleteFlowDisabled-0')).toBeInTheDocument();

        // Open flow
        fireEvent.click(flowButton);
        expect(getByText("Mapping1")).toBeInTheDocument();
        expect(getByLabelText('runStep-2')).toBeInTheDocument(); // Has operator priv's, can still run
        expect(getByLabelText('deleteStepDisabled-testFlow-2')).toBeInTheDocument();

        // Open Add Step
        let addStep = getByText('Add Step');
        fireEvent.click(addStep);
        expect(queryByLabelText('("Step 1')).not.toBeInTheDocument();

    });

    it('user without flow write or operator privileges cannot edit or run', () => {
        const {getByText, getByLabelText, queryByLabelText} = render(
            <Router history={history}><Flows 
                {...flowsProps}
                canReadFlow={true}
                canWriteFlow={false}
                hasOperatorRole={false}
            /></Router>
        );

        let flowButton = getByLabelText('icon: right');
        expect(getByText("testFlow")).toBeInTheDocument();
        expect(getByLabelText('create-flow-disabled')).toBeInTheDocument();
        expect(getByLabelText('deleteFlowDisabled-0')).toBeInTheDocument();

        // Open flow
        fireEvent.click(flowButton);
        expect(getByText("Mapping1")).toBeInTheDocument();
        expect(getByLabelText('runStepDisabled-2')).toBeInTheDocument();
        expect(getByLabelText('deleteStepDisabled-testFlow-2')).toBeInTheDocument();

        // Open Add Step
        let addStep = getByText('Add Step');
        fireEvent.click(addStep);
        expect(queryByLabelText('("Step 1')).not.toBeInTheDocument();

    });

    it('user without flow read, write, or operator privileges cannot view, edit, or run', () => {
        const {queryByText, queryByLabelText} = render(
            <Router history={history}><Flows 
                {...flowsProps}
                canReadFlow={false}
                canWriteFlow={false}
                hasOperatorRole={false}
            /></Router>
        );

        // Nothing shown, including Create button
        expect(queryByLabelText('("icon: right')).not.toBeInTheDocument();
        expect(queryByText('("testFlow')).not.toBeInTheDocument();

    });

});