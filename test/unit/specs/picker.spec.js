import Picker from 'packages/picker';
import PickerColumn from 'packages/picker/PickerColumn';
import { mount } from 'avoriaz';
import { dragHelper } from '../utils';

const pickerColumns = [
  {
    values: ['vip', 'normal'],
    className: 'column1'
  },
  {
    values: ['1990', '1991', '1992', '1993', '1994', '1995'],
    className: 'column2'
  }
];

describe('Picker', () => {
  let wrapper;
  afterEach(() => {
    wrapper && wrapper.destroy();
  });

  it('create picker', () => {
    wrapper = mount(Picker, {
      propsData: {
        columns: pickerColumns
      }
    });

    expect(wrapper.hasClass('van-picker')).to.be.true;

    expect(wrapper.vm.getColumnValues(0).length).to.equal(2);
    expect(wrapper.vm.getValues().length).to.equal(2);
  });

  it('set picker values', () => {
    wrapper = mount(Picker, {
      propsData: {
        columns: pickerColumns
      }
    });

    expect(wrapper.vm.getColumnValues(0).length).to.equal(2);
    expect(wrapper.vm.getColumnValues(1).length).to.equal(6);

    expect(wrapper.vm.getColumnValue(0)).to.equal('vip');
    expect(wrapper.vm.getColumnValue(1)).to.equal('1990');

    wrapper.vm.setColumnValue(0, 'normal');
    expect(wrapper.vm.getColumnValue(0)).to.equal('normal');

    wrapper.vm.setColumnIndex(0, 0);
    expect(wrapper.vm.getColumnValue(0)).to.equal('vip');

    wrapper.vm.setColumnValue(1, '1991');
    expect(wrapper.vm.getColumnValue(1)).to.equal('1991');

    wrapper.vm.setColumnValues(0, ['vip', 'normal', 'other']);
    expect(wrapper.vm.getColumnValues(0).length).to.equal(3);
    expect(wrapper.vm.getValues().length).to.equal(2);

    wrapper.vm.setValues(['vip', '1992']);
    expect(wrapper.vm.getColumnIndex(0)).to.equal(0);
    expect(wrapper.vm.getColumnIndex(1)).to.equal(2);
    expect(wrapper.vm.getColumnIndex(2)).to.equal(undefined);

    wrapper.vm.setIndexes([1, 4]);
    expect(wrapper.vm.getColumnValue(0)).to.equal('normal');
    expect(wrapper.vm.getColumnValue(1)).to.equal('1994');
    expect(wrapper.vm.getColumnValue(2)).to.equal(undefined);
  });

  it('create a invalid columns picker', () => {
    wrapper = mount(Picker, {
      propsData: {
        columns: undefined
      }
    });

    expect(wrapper.hasClass('van-picker')).to.be.true;
    expect(wrapper.vm.currentColumns.length).to.equal(0);
  });

  it('set invalid index columns', () => {
    wrapper = mount(Picker, {
      propsData: {
        columns: pickerColumns
      }
    });

    expect(wrapper.vm.getColumnValues(3)).to.equal(undefined);
    wrapper.vm.setColumnValues(3, [1, 2]);
    expect(wrapper.vm.getColumnValues(3)).to.equal(undefined);

    expect(wrapper.vm.getColumnValue(3)).to.equal(undefined);
    wrapper.vm.setColumnValue(3, 3);
    expect(wrapper.vm.getColumnValue(3)).to.equal(undefined);
  });

  it('emit a change event when column change', (done) => {
    wrapper = mount(Picker, {
      propsData: {
        columns: pickerColumns
      }
    });

    const eventStub = sinon.stub(wrapper.vm, '$emit');
    wrapper.vm.setColumnValue(0, 'normal');
    wrapper.vm.$nextTick(() => {
      expect(eventStub.calledOnce).to.be.true;
      expect(eventStub.calledWith('change'));
      done();
    });
  });

  it('create a empty picker and emit a cencel event', (done) => {
    wrapper = mount(Picker, {
      propsData: {
        showToolbar: true
      }
    });

    expect(wrapper.hasClass('van-picker')).to.be.true;
    expect(wrapper.contains('.van-picker__toolbar')).to.be.true;
    expect(wrapper.vm.currentColumns.length).to.equal(0);

    const eventStub = sinon.stub(wrapper.vm, '$emit');
    const cancelBtn = wrapper.find('.van-picker__cancel')[0];
    cancelBtn.trigger('click');

    wrapper.vm.$nextTick(() => {
      expect(eventStub.calledOnce).to.be.true;
      expect(eventStub.calledWith('cancel'));
      done();
    });
  });

  it('create a empty picker and emit a confirm event', (done) => {
    wrapper = mount(Picker, {
      propsData: {
        showToolbar: true
      }
    });

    expect(wrapper.hasClass('van-picker')).to.be.true;
    expect(wrapper.contains('.van-picker__toolbar')).to.be.true;

    const eventStub = sinon.stub(wrapper.vm, '$emit');
    const cancelBtn = wrapper.find('.van-picker__confirm')[0];
    cancelBtn.trigger('click');

    wrapper.vm.$nextTick(() => {
      expect(eventStub.calledOnce).to.be.true;
      expect(eventStub.calledWith('confirm'));
      done();
    });
  });
});

describe('PickerColumn', () => {
  let wrapper;
  afterEach(() => {
    wrapper && wrapper.destroy();
  });

  it('create a picker-column', () => {
    wrapper = mount(PickerColumn);

    expect(wrapper.hasClass('van-picker-column')).to.be.true;
    expect(wrapper.vm.options.length).to.equal(0);
  });

  it('change picker-column value', (done) => {
    wrapper = mount(PickerColumn, {
      propsData: {
        options: [1, 2, 3, 4, 5],
        value: 1
      }
    });

    expect(wrapper.vm.options.length).to.equal(5);

    wrapper.vm.setValue(3);
    wrapper.vm.$nextTick(() => {
      expect(wrapper.vm.currentValue).to.equal(3);
      done();
    });
  });

  it('change picker-column values', (done) => {
    wrapper = mount(PickerColumn);

    expect(wrapper.vm.options.length).to.equal(0);

    wrapper.vm.options = [1, 2];
    wrapper.vm.$nextTick(() => {
      expect(wrapper.vm.options.length).to.equal(2);
      done();
    });
  });

  it('select disabled options', () => {
    wrapper = mount(PickerColumn, {
      propsData: {
        options: [
          { text: '1', disabled: true },
          { text: '2' },
          { text: '3', disabled: true },
          { text: '4', disabled: true }
        ],
        valueKey: 'text'
      }
    });
    expect(wrapper.vm.currentIndex).to.equal(1);

    wrapper.vm.setIndex(3);
    expect(wrapper.vm.currentIndex).to.equal(1);
  });

  it('drag options', () => {
    wrapper = mount(PickerColumn, {
      propsData: {
        options: pickerColumns[1].values
      }
    });
    expect(wrapper.vm.currentIndex).to.equal(0);

    const column = wrapper.find('.van-picker-column ul')[0];
    dragHelper(column, 0);
    expect(wrapper.vm.currentIndex).to.equal(0);

    dragHelper(column, -100);
    expect(wrapper.vm.currentIndex).to.equal(2);
  });
});
