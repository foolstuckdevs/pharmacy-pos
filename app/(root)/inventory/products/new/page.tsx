import ProductForm from '@/components/ProductForm';
import { getCategories } from '@/lib/actions/categories';
import { getSuppliers } from '@/lib/actions/suppliers';

const Page = async () => {
  const pharmacyId = 1;

  const categories = await getCategories(pharmacyId);
  const suppliers = await getSuppliers(pharmacyId);

  return (
    <div className="p-4">
      <ProductForm
        type="create"
        categories={categories}
        suppliers={suppliers}
      />
    </div>
  );
};

export default Page;
